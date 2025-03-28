/* eslint-disable no-useless-catch */
/* eslint-disable no-empty */

import { StatusCodes } from 'http-status-codes'
import { cartModel } from '~/models/cartModel'
import { orderModel } from '~/models/orderModel'
import { productModel } from '~/models/productModel'
import { shopModel } from '~/models/shopModel'
import ApiError from '~/utils/ApiError'

const clusterOrder = async (buyerId, reqBody) => {
  try {
    const itemList = reqBody.itemList

    // Phân loại từng đơn hàng
    let clusteredOrderList = []

    for ( let item of itemList ) {
      const { productId, typeId, quantity } = item
      const product = await productModel.findOneById(productId)

      if (!product) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Sản phẩm không hợp lệ')

      // Thông số của loại sản phẩm
      if (!product.typeFeature) throw new ApiError(StatusCodes.CONFLICT, 'Sản phẩm không có type')
      const { typeName, discount, price } = (product.typeFeature).find((type) => type.typeId.toString() === typeId)
      const finalPrice = price*( 1 - discount/100 )

      // Validate lại item trong itemList
      const validItem = {
        ...item,
        productName : product.name,
        typeName: typeName,
        price: finalPrice,
        avatar: product.avatar
      }


      // Tìm shop đầu tiên có loại sản phẩm này
      if (!product.shopTypes) throw new ApiError(StatusCodes.CONFLICT, 'Sản phẩm không có mẫu này')
      const shopList = product.shopTypes
      const foundShop = shopList.find((shop) => shop.types.some((type) => type.typeId.toString() === typeId && type.stock >= quantity))

      if (!foundShop) throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy shop có mẫu sản phẩm này')

      const foundShopId = foundShop.shopId


      const shop = await shopModel.findOneById(foundShopId)
      if (!shop) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Shop không hợp lệ')

      const shopAddress = shop.shopAddress


      let foundClusteredOrder = clusteredOrderList.find(item => item.shopId.toString() === foundShopId.toString())

      if (foundClusteredOrder) {
        foundClusteredOrder.itemList.push(validItem)
        foundClusteredOrder.orgPrice += finalPrice*quantity
      } else {
        const newClusteredOrder = {
          buyerId: buyerId,
          sellerId: product.sellerId,
          shopId: foundShopId,
          orgPrice: finalPrice*quantity,
          buyerPhone: reqBody.buyerPhone,
          buyerName: reqBody.buyerName,
          buyerEmail: reqBody.buyerEmail,
          shopAddress: shopAddress,
          buyerAddress: reqBody.buyerAddress,
          itemList: [validItem]
        }
        clusteredOrderList.push(newClusteredOrder)
      }
    }
    return clusteredOrderList
  } catch (error) {
    throw error
  }
}


const addOrder = async (buyerId, reqBody) => {
  try {
    const { sellerId, shopId, orgPrice, discountCode, finalPrice, buyerPhone, buyerName, buyerEmail, note, buyerAddress, shippingFee, shippingMethod, itemList } = reqBody

    const orderData = {
      ...reqBody,
      buyerId: buyerId
    }

    const insertedOrder = await orderModel.addOrder(orderData)

    let updatedItemList = []
    for ( let item of itemList) {
      const updatedItem = await productModel.increaseStock(item.productId, item.typeId, shopId, -item.quantity)
      await cartModel.deleteItem(buyerId, {
        productId : item.productId,
        typeId: item.typeId
      })
      updatedItemList.push(updatedItem)
    }

    return { insertedOrder, updatedItemList }
  } catch (error) {
    throw error
  }
}

export const orderService = {
  addOrder,
  clusterOrder
}