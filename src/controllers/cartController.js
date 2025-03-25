import { StatusCodes } from 'http-status-codes'
import { cartService } from '~/services/cartService'

const getCart = async (req, res, next) => {
  try {
    const buyerId = req.jwtDecoded._id
    const cart = await cartService.getCart(buyerId)

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

const update = async (req, res, next) => {
  try {
    const buyerId = req.jwtDecoded._id
    const updatedCart = await cartService.update(buyerId, req.body)

    res.status(StatusCodes.CREATED).json(updatedCart)
  } catch (error) { next(error) }
}

const deleteItem = async (req, res, next) => {
  try {
    const buyerId = req.jwtDecoded._id
    const updatedCart = await cartService.deleteItem(buyerId, req.body)

    res.status(StatusCodes.CREATED).json(updatedCart)
  } catch (error) { next(error) }
}

export const cartController = {
  getCart,
  addToCart,
  update,
  deleteItem
}