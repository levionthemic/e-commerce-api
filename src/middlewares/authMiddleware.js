import { StatusCodes } from 'http-status-codes'
import { env } from '~/config/environment'
import { sessionModel } from '~/models/sessionModel'
import { JwtProvider } from '~/providers/JwtProvider'
import ApiError from '~/utils/ApiError'

const isAuthorized = async (req, res, next) => {
  const clientAccessToken = req.cookies?.accessToken
  if (!clientAccessToken) {
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized! Please Login!'))
    return
  }

  const sessionId = req.cookies?.sessionId
  if (!sessionId) {
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized! Please Login!'))
    return
  }
  const session = await sessionModel.findOneBySessionId(sessionId)
  if (!session || session.isRevoked || session.expiresAt < new Date()) {
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid session or session expired'))
    return
  }

  if (session.userAgent !== req.headers['user-agent'] || session.ipAddress !== req.ip) {
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Session mismatch with current device/browser'))
    return
  }

  try {
    const accessTokenDecoded = await JwtProvider.verify(
      clientAccessToken,
      env.ACCESS_TOKEN_SECRET_SIGNATURE
    )

    req.jwtDecoded = accessTokenDecoded

    next()
  } catch (error) {
    if (error?.message?.includes('jwt expired')) {
      next(new ApiError(StatusCodes.GONE, 'Need to refresh token!'))
      return
    }

    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized! Please Login!'))
  }
}

export const authMiddleware = { isAuthorized }