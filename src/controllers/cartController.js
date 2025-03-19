import { StatusCodes } from 'http-status-codes'
import { cartService } from '~/services/cartService'

const getCart = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const cart = await cartService.getCart(userId)

    res.status(StatusCodes.OK).json(cart)
  } catch (error) { next(error) }
}

const addToCart = async (req, res, next) => {
  try {
    const buyerId = req.jwtDecoded._id
    const createdCart = await cartService.addToCart(buyerId, req.body)

    res.status(StatusCodes.CREATED).json(createdCart)
  } catch (error) { next(error) }
}

export const cartController = {
  getCart,
  addToCart
}