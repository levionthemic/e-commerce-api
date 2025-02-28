import { StatusCodes } from 'http-status-codes'
import { cartService } from '~/services/cartService'

export const getCart = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const cart = await cartService.getCart(userId)

    res.status(StatusCodes.OK).json(cart)
  } catch (error) { next(error) }
}

export const cartController = {
  getCart
}