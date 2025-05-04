import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { ACCOUNT_ROLE, WEBSITE_DOMAIN } from '~/utils/constants'
import { pickUser } from '~/utils/formatters'
import { sendMail } from '~/utils/sendMail'
import { JwtProvider } from '~/providers/JwtProvider'
import { env } from '~/config/environment'
import axios from 'axios'
import { buyerModel } from '~/models/buyerModel'
import { sellerModel } from '~/models/sellerModel'
import { cartModel } from '~/models/cartModel'
import { sessionModel } from '~/models/sessionModel'
import { generateSecureOTP } from '~/utils/algorithms'
import { otpModel } from '~/models/otpModel'

const getModel = (role) => {
  if (role === ACCOUNT_ROLE.BUYER) {
    return buyerModel
  } else if (role === ACCOUNT_ROLE.SELLER) {
    return sellerModel
  }
  return null
}

/* eslint-disable no-useless-catch */
const login = async (reqBody, userAgent, ipAddress) => {
  try {
    const existUser = await getModel(reqBody.role).findOneByEmail(reqBody.email)

    if (!existUser)
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        'Tài khoản của bạn không tồn tại!'
      )
    if (!existUser.isVerified)
      throw new ApiError(
        StatusCodes.NOT_ACCEPTABLE,
        'Tài khoản của bạn chưa được xác thực. Vui lòng kiểm tra và xác thực trong email của bạn!'
      )
    if (!bcryptjs.compareSync(reqBody.password, existUser.password)) {
      throw new ApiError(
        StatusCodes.NOT_ACCEPTABLE,
        'Email hoặc Mật khẩu của bạn chưa đúng!'
      )
    }

    const userInfo = {
      _id: existUser._id,
      email: existUser.email
    }

    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      env.ACCESS_TOKEN_LIFE
    )

    const refreshToken = await JwtProvider.generateToken(
      userInfo,
      env.REFRESH_TOKEN_SECRET_SIGNATURE,
      env.REFRESH_TOKEN_LIFE
    )

    // Store refreshToken in DB and send sesssionId to FE
    const sessionId = uuidv4()

    await sessionModel.create({
      sessionId,
      userId: existUser._id.toString(),
      refreshToken,
      userAgent: userAgent,
      ipAddress: ipAddress,
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    })

    return {
      ...pickUser(existUser),
      accessToken,
      sessionId,
      role: reqBody.role
    }
  } catch (error) {
    throw error
  }
}

const loginWithGoogle = async (reqBody, userAgent, ipAddress) => {
  const googleAccessToken = reqBody.access_token
  try {
    const googleRes = await axios.get(
      `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${googleAccessToken}`
    )
    const user = googleRes.data

    if (user.aud !== env.GOOGLE_CLIENT_ID) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        'Unauthorized: Invalid token audience'
      )
    }

    const existUserFromBuyer = await buyerModel.findOneByEmail(user.email)
    const existUserFromSeller = await sellerModel.findOneByEmail(user.email)

    let existUser = existUserFromBuyer || existUserFromSeller

    let role = ''
    if (existUserFromBuyer) role = ACCOUNT_ROLE.BUYER
    if (existUserFromSeller) role = ACCOUNT_ROLE.SELLER

    // Email not exist, create new account without verification
    if (!existUser) {
      const newUserData = {
        email: user.email,
        username: user.email.split('@')[0],
        isVerified: true,
        verifyToken: null,
        password: bcryptjs.hashSync(uuidv4(), 8)
      }
      const createdUser = await buyerModel.register(newUserData)
      existUser = await buyerModel.findOneById(createdUser.insertedId)
      role = ACCOUNT_ROLE.BUYER

      // Create Cart if role is buyer
      await cartModel.createNew(createdUser.insertedId.toString())
    }

    const userInfo = {
      _id: existUser._id,
      email: existUser.email
    }

    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      env.ACCESS_TOKEN_LIFE
    )

    const refreshToken = await JwtProvider.generateToken(
      userInfo,
      env.REFRESH_TOKEN_SECRET_SIGNATURE,
      env.REFRESH_TOKEN_LIFE
    )

    // Store refreshToken in DB and send sesssionId to FE
    const sessionId = uuidv4()

    await sessionModel.create({
      sessionId,
      userId: existUser._id.toString(),
      refreshToken,
      userAgent: userAgent,
      ipAddress: ipAddress,
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    })

    return { ...pickUser(existUser), accessToken, sessionId, role }
  } catch (error) {
    throw error
  }
}

const register = async (reqBody) => {
  try {
    // Check if email existed
    const existUser = await getModel(reqBody.role).findOneByEmail(reqBody.email)
    if (existUser) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email already existed!')
    }

    // Create user data for inserting into DB
    const newUserData = {
      email: reqBody.email,
      password: bcryptjs.hashSync(reqBody.password, 8),
      username: reqBody.email.split('@')[0],

      isVerified: false,
      verifyToken: uuidv4()
    }
    // Insert user into DB
    const createdUser = await getModel(reqBody.role).register(newUserData)

    // Create Cart if role is buyer
    if (reqBody.role === ACCOUNT_ROLE.BUYER) {
      await cartModel.createNew(createdUser.insertedId.toString())
    }

    // Send verification link to user's email
    const getNewUser = await getModel(reqBody.role).findOneById(
      createdUser.insertedId
    )

    const verificationLink = `${WEBSITE_DOMAIN}/verify-account?email=${getNewUser.email}&token=${getNewUser.verifyToken}&role=${reqBody.role}`
    const customSubject =
      'E-Commerce Website: Hãy xác thực email của bạn trước khi sử dụng dịch vụ của chúng tôi!'
    const htmlContent = `
      <h3>Please click the following link to verify your account:</h3>
      <h3>${verificationLink}</h3>
      <h3>Sincerely, <br /> - Levionthemic - </h3>
    `
    sendMail(getNewUser.email, customSubject, htmlContent)

    // Return data for Controller
    return pickUser(getNewUser)
  } catch (error) {
    throw error
  }
}

const registerWithGoogle = async (reqBody) => {
  const googleAccessToken = reqBody.access_token
  try {
    const googleRes = await axios.get(
      `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${googleAccessToken}`
    )
    const user = googleRes.data

    if (user.aud !== env.GOOGLE_CLIENT_ID) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        'Unauthorized: Invalid token audience'
      )
    }

    const existUser = await buyerModel.findOneByEmail(user.email)
    if (existUser) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email already existed!')
    }

    const newUserData = {
      email: user.email,
      username: user.email.split('@')[0],
      isVerified: true,
      verifyToken: null,
      password: bcryptjs.hashSync(uuidv4(), 8)
    }
    const createdUser = await buyerModel.register(newUserData)

    await cartModel.createNew(createdUser.insertedId.toString())

    const getNewUser = await buyerModel.findOneById(createdUser.insertedId)

    return { ...pickUser(getNewUser) }
  } catch (error) {
    throw error
  }
}

const verifyAccount = async (reqBody) => {
  try {
    const existUser = await getModel(reqBody.role).findOneByEmail(reqBody.email)

    if (!existUser)
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        'Tài khoản của bạn không tồn tại!'
      )
    if (existUser.isVerified)
      throw new ApiError(
        StatusCodes.NOT_ACCEPTABLE,
        'Tài khoản của bạn đã được xác thực!'
      )
    if (existUser.verifyToken !== reqBody.token)
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Token không hợp lệ!')

    let updateData = {
      isVerified: true,
      verifyToken: null
    }

    const updatedUser = await getModel(reqBody.role).update(
      existUser._id,
      updateData
    )

    return updatedUser
  } catch (error) {
    throw error
  }
}

const refreshToken = async (clientSessionId) => {
  try {
    const session = await sessionModel.findOneBySessionId(clientSessionId)

    if (!session || session.isRevoked) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid session')
    }

    const refresTokenDecoded = await JwtProvider.verify(
      session.refreshToken,
      env.REFRESH_TOKEN_SECRET_SIGNATURE
    )

    const userInfo = {
      _id: refresTokenDecoded._id,
      email: refresTokenDecoded.email
    }

    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      env.ACCESS_TOKEN_LIFE
    )

    return { accessToken }
  } catch (error) {
    throw error
  }
}

const forgotPassword = async (reqBody) => {
  try {
    const { email } = reqBody
    const existUser = await buyerModel.findOneByEmail(email)

    if (!existUser) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email not existed!')
    }

    const otpCode = generateSecureOTP()

    const newOtpRecord = {
      identifier: email,
      code: bcryptjs.hashSync(otpCode, 8),
      expiresAt: new Date(Date.now() + 1 * 60 * 1000) // 5 mins
    }

    await otpModel.create(newOtpRecord)

    const htmlContent = `
      <!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Mã xác thực OTP</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f9fafb;
        color: #111827;
        padding: 20px;
      }
      .container {
        max-width: 480px;
        margin: auto;
        background: white;
        padding: 24px;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0,0,0,0.05);
      }
      .otp-code {
        font-size: 32px;
        font-weight: bold;
        color: #1d4ed8;
        letter-spacing: 8px;
        margin: 20px 0;
        text-align: center;
      }
      .footer {
        font-size: 12px;
        color: #6b7280;
        margin-top: 24px;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>Xin chào,</h2>
      <p>Bạn vừa yêu cầu một mã xác thực (OTP). Vui lòng sử dụng mã bên dưới để hoàn tất bước xác minh:</p>

      <div class="otp-code">${otpCode}</div>

      <p>Mã này sẽ hết hạn sau 3 phút.</p>

      <p>Nếu bạn không yêu cầu, bạn có thể bỏ qua email này.</p>

      <div class="footer">
        © 2025 LEVI. Mọi quyền được bảo lưu.
      </div>
    </div>
  </body>
</html>
    `
    const customSubject = 'E-Commerce Website: Mã OTP khôi phục mật khẩu'

    sendMail(email, customSubject, htmlContent)
    return
  } catch (error) {
    throw error
  }
}

const verifyOtp = async (reqBody) => {
  try {
    const { email, otpCode } = reqBody
    const otpRecord = await otpModel.findOneByIdentifier(email)
    if (!otpRecord) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'OTP đã hết hạn!')
    }

    if (!bcryptjs.compareSync(otpCode, otpRecord.code)) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'OTP không hợp lệ!')
    }

    await otpModel.deleteOtpById(otpRecord._id)

    const resetToken = await JwtProvider.generateToken(
      { email: email },
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      10 * 60
    )

    return { resetToken, expiresIn: '10 mins' }
  } catch (error) {
    throw error
  }
}

export const authService = {
  login,
  loginWithGoogle,
  register,
  registerWithGoogle,
  verifyAccount,
  refreshToken,
  forgotPassword,
  verifyOtp
}
