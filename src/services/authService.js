import { StatusCodes } from 'http-status-codes'
import { authModel } from '~/models/authModel'
import ApiError from '~/utils/ApiError'
import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { WEBSITE_DOMAIN } from '~/utils/constants'
import { pickUser } from '~/utils/formatters'
import { sendMail } from '~/utils/sendMail'
import { JwtProvider } from '~/providers/JwtProvider'
import { env } from '~/config/environment'

/* eslint-disable no-useless-catch */
const login = async (reqBody) => {
  try {
    const existUser = await authModel.findOneByEmail(reqBody.email)

    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Tài khoản của bạn không tồn tại!')
    if (!existUser.isVerified) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Tài khoản của bạn chưa được xác thực. Vui lòng kiểm tra và xác thực trong email của bạn!')
    if (!bcryptjs.compareSync(reqBody.password, existUser.password)) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Email hoặc Mật khẩu của bạn chưa đúng!')
    }
    if (reqBody.role !== existUser.role) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Vai trò không khớp!')
    }

    const userInfo = {
      _id: existUser._id,
      email: existUser.email
    }

    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      // env.ACCESS_TOKEN_LIFE
      5
    )

    const refreshToken = await JwtProvider.generateToken(
      userInfo,
      env.REFRESH_TOKEN_SECRET_SIGNATURE,
      env.REFRESH_TOKEN_LIFE
    )

    return { ...pickUser(existUser), accessToken, refreshToken }
  } catch (error) { throw error }
}

const register = async (reqBody) => {
  try {
    // Check if email existed
    const existUser = await authModel.findOneByEmail(reqBody.email)
    if (existUser) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email already existed!')
    }

    // Create user data for inserting into DB
    const newUserData = {
      email: reqBody.email,
      password: bcryptjs.hashSync(reqBody.password, 8),
      displayName: reqBody.email.split('@')[0],
      role: reqBody.role,

      isVerified: false,
      verifyToken: uuidv4()

    }
    // Insert user into DB
    const createdUser = await authModel.register(newUserData)

    // Send verification link to user's email
    const getNewUser = await authModel.findOneById(createdUser.insertedId)

    const verificationLink = `${WEBSITE_DOMAIN}/verify-account?email=${getNewUser.email}&token=${getNewUser.verifyToken}`
    const customSubject = 'E-Commerce Website: Hãy xác thực email của bạn trước khi sử dụng dịch vụ của chúng tôi!'
    const htmlContent = `
      <h3>Please click the following link to verify your account:</h3>
      <h3>${verificationLink}</h3>
      <h3>Sincerely, <br /> - Levionthemic - </h3>
    `
    sendMail(getNewUser.email, customSubject, htmlContent)

    // Return data for Controller
    return pickUser(getNewUser)
  } catch (error) { throw error }
}

const verifyAccount = async (reqBody) => {
  try {
    const existUser = await authModel.findOneByEmail(reqBody.email)

    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Tài khoản của bạn không tồn tại!')
    if (existUser.isVerified) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Tài khoản của bạn đã được xác thực!')
    if (existUser.verifyToken !== reqBody.token) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Token không hợp lệ!')

    let updateData = {
      isVerified: true,
      verifyToken: null
    }

    const updatedUser = await authModel.update(existUser._id, updateData)

    return updatedUser
  } catch (error) { throw error }
}

const refreshToken = async (clientRefreshToken) => {
  try {
    const refresTokenDecoded = await JwtProvider.verify(
      clientRefreshToken,
      env.REFRESH_TOKEN_SECRET_SIGNATURE
    )

    const userInfo = {
      _id: refresTokenDecoded._id,
      email: refresTokenDecoded.email
    }

    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      // env.ACCESS_TOKEN_LIFE
      5
    )

    return { accessToken }
  } catch (error) { throw error }
}

export const authService = {
  login,
  register,
  verifyAccount,
  refreshToken
}