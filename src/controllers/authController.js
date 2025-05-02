import { StatusCodes } from 'http-status-codes'
import ms from 'ms'
import { sessionModel } from '~/models/sessionModel'
import { authService } from '~/services/authService'
import ApiError from '~/utils/ApiError'

const login = async (req, res, next) => {
  try {
    let result = {}

    const userAgent = req.headers['user-agent']
    const ipAddress = req.ip

    if (req.body.access_token) {
      result = await authService.loginWithGoogle(req.body)
    } else {
      result = await authService.login(req.body, userAgent, ipAddress)
    }

    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days')
    })

    res.cookie('sessionId', result.sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days')
    })

    delete result['accessToken']
    delete result['refreshToken']

    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const register = async (req, res, next) => {
  try {
    const createdUser = await authService.register(req.body)
    return res.status(StatusCodes.CREATED).json(createdUser)
  } catch (error) { next(error) }
}

const verifyAccount = async (req, res, next) => {
  try {
    const verifiedUser = await authService.verifyAccount(req.body)
    return res.status(StatusCodes.CREATED).json(verifiedUser)
  } catch (error) { next(error) }
}

const refreshToken = async (req, res, next) => {
  try {
    const result = await authService.refreshToken(req.cookies?.sessionId)
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days')
    })
    res.status(StatusCodes.OK).json({ accessToken: result.accessToken })
  } catch (error) {
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Please Sign In! (Error from refresh Token)'))
  }
}

const logout = async (req, res, next) => {
  try {
    await sessionModel.revokeSession(req.cookies.sessionId)

    res.clearCookie('accessToken')
    res.clearCookie('sessionId')

    res.status(StatusCodes.OK).json({ loggedOut: true })
  } catch (error) { next(error) }
}

export const authController = {
  login,
  register,
  verifyAccount,
  refreshToken,
  logout
}