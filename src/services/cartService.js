/* eslint-disable no-useless-catch */
import { cartModel } from '~/models/old-cartModel'

export const getCart = async (userId) => {
  try {
    const result = await cartModel.getCart(userId)
    return result
  } catch (error) { throw error }
}

export const cartService = {
  getCart
}