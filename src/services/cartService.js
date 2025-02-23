/* eslint-disable no-useless-catch */
import { cartModel } from '~/models/cartModel'

export const getCarts = async (userId) => {
  try {
    const result = await cartModel.getCarts(userId)
    return result
  } catch (error) { throw error }
}

export const cartService = {
  getCarts
}