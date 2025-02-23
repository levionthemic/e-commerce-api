import { StatusCodes } from 'http-status-codes'
import { cartService } from '~/services/cartService'

export const getCarts = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const carts = await cartService.getCarts(userId)

    res.status(StatusCodes.OK).json({ carts })
  } catch (error) { next(error) }
}

export const cartController = {
  getCarts
}