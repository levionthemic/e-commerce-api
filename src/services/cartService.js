/* eslint-disable no-useless-catch */
import { StatusCodes } from 'http-status-codes'
import { cartModel } from '~/models/cartModel'
import ApiError from '~/utils/ApiError'

const getCart = async (userId) => {
  try {
    const result = await cartModel.getCart(userId)
    return result
  } catch (error) { throw error }
}

const addToCart = async (buyerId, reqBody) => {
  try {
    const existCart = await cartModel.findOneByBuyerId(buyerId)

    if (!existCart) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Giỏ hàng không hợp lệ')

    const itemList = existCart.itemList
    const { productId, typeId, quantity } = reqBody

    let isExistedItem = false
    itemList.forEach(item => {
      if (!isExistedItem && item.productId === productId && item.typeId === typeId) {
        item.quantity += quantity
        isExistedItem = true
      }
    })
    if (!isExistedItem) itemList.push({ productId, typeId, quantity })

    const result = await cartModel.updateItemLists(buyerId, itemList)
    return result
  } catch (error) { throw error }
}

export const cartService = {
  getCart,
  addToCart
}