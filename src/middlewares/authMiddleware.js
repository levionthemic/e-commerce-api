import { StatusCodes } from 'http-status-codes'
import { env } from '~/config/environment'
import { buyerModel } from '~/models/buyerModel'
import { sellerModel } from '~/models/sellerModel'
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
    next(
      new ApiError(
        StatusCodes.UNAUTHORIZED,
        'Invalid session or session expired'
      )
    )
    return
  }

  if (
    session.userAgent !== req.headers['user-agent'] ||
    session.ipAddress !== req.ip
  ) {
    next(
      new ApiError(
        StatusCodes.UNAUTHORIZED,
        'Session mismatch with current device/browser'
      )
    )
    return
  }

  try {
    const accessTokenDecoded = await JwtProvider.verify(
      clientAccessToken,
      env.ACCESS_TOKEN_SECRET_SIGNATURE
    )

    const buyerUser = await buyerModel.findOneById(accessTokenDecoded._id)
    const sellerUser = await sellerModel.findOneById(accessTokenDecoded._id)

    const url = req.url
    if (url.includes('/seller') && buyerUser) {
      next(
        new ApiError(
          StatusCodes.UNAUTHORIZED,
          'Unauthorized: Role permission'
        )
      )
      return
    }

    if (!url.includes('/seller') && sellerUser) {
      next(
        new ApiError(
          StatusCodes.UNAUTHORIZED,
          'Unauthorized: Role permission'
        )
      )
      return
    }

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
