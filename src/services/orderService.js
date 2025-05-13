/* eslint-disable no-useless-catch */
/* eslint-disable no-empty */

import { StatusCodes } from 'http-status-codes'
import { createGHNOrder } from '~/apis'
// import { createGHNOrder } from '~/apis'
import { cartModel } from '~/models/cartModel'
import { orderModel } from '~/models/orderModel'
import { productModel } from '~/models/productModel'
import { sellerModel } from '~/models/sellerModel'
// import { sellerModel } from '~/models/sellerModel'
import { shopModel } from '~/models/shopModel'
import { GHNProvider } from '~/providers/GHNProvider'
// import { GHNProvider } from '~/providers/GHNProvider'
import ApiError from '~/utils/ApiError'
import { ORDER_STATUS } from '~/utils/constants'

/**
 * Buyer APIs
 * @author taiki and levi
 */
const clusterOrder = async (buyerId, reqBody) => {
  try {
    const itemList = reqBody.itemList

    // Phân loại từng đơn hàng
    let clusteredOrderList = []

    for (let item of itemList) {
      const { productId, typeId, quantity } = item
      const product = await productModel.findOneById(productId)

      if (!product)
        throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Sản phẩm không hợp lệ')

      // Thông số của loại sản phẩm
      if (!product.typeFeature)
        throw new ApiError(StatusCodes.CONFLICT, 'Sản phẩm không có type')
      const { typeName, discount, price } = product.typeFeature.find(
        (type) => type.typeId.toString() === typeId
      )
      const finalPrice = price * (1 - discount / 100)

      // Tìm shop đầu tiên có loại sản phẩm này
      if (!product.shopTypes)
        throw new ApiError(StatusCodes.CONFLICT, 'Sản phẩm không có mẫu này')
      const shopList = product.shopTypes
      const foundShop = shopList.find((shop) =>
        shop.types.some(
          (type) => type.typeId.toString() === typeId && type.stock >= quantity
        )
      )

      if (!foundShop)
        throw new ApiError(
          StatusCodes.NOT_FOUND,
          'Không tìm thấy shop có mẫu sản phẩm này'
        )

      const foundShopId = foundShop.shopId

      const shop = await shopModel.findOneById(foundShopId)
      if (!shop)
        throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Shop không hợp lệ')

      const shopAddress = shop.shopAddress

      let itemQuantityArr = []
      const maxQuantityPerOrder = Math.floor(50000000 / finalPrice)
      const count = Math.floor(quantity / maxQuantityPerOrder)
      for (let i = 0; i < count; i++) itemQuantityArr.push(maxQuantityPerOrder)
      const lastOrderQuantity = quantity % maxQuantityPerOrder
      if (lastOrderQuantity > 0) itemQuantityArr.push(lastOrderQuantity)

      itemQuantityArr.forEach((quantity) => {
        let foundClusteredOrder = clusteredOrderList.find(
          (order) =>
            order.shopId.toString() === foundShopId.toString() &&
            order.orgPrice + finalPrice * quantity <= 50000000
        )
        // Validate lại item trong itemList
        const validItem = {
          ...item,
          quantity: quantity,
          productName: product.name,
          typeName: typeName,
          price: finalPrice,
          avatar: product.avatar
        }
        if (foundClusteredOrder) {
          foundClusteredOrder.itemList.push(validItem)
          foundClusteredOrder.orgPrice += finalPrice * quantity
        } else {
          const newClusteredOrder = {
            buyerId: buyerId,
            sellerId: product.sellerId,
            shopId: foundShopId,
            orgPrice: finalPrice * quantity,
            shopAddress: shopAddress,
            itemList: [validItem]
          }
          clusteredOrderList.push(newClusteredOrder)
        }
      })
    }
    return clusteredOrderList
  } catch (error) {
    throw error
  }
}

const addOrder = async (buyerId, reqBody) => {
  try {
    const orderData = {
      ...reqBody,
      buyerId: buyerId
    }

    const insertedOrder = await orderModel.addOrder(orderData)

    let updatedItemList = []
    for (let item of reqBody.itemList) {
      const updatedItem = await productModel.increaseStock(
        item.productId,
        item.typeId,
        reqBody.shopId,
        -item.quantity
      )
      // Với trường hợp Mua ngay, không xóa trong cart
      await cartModel.deleteItem(buyerId, {
        productId: item.productId,
        typeId: item.typeId
      })
      updatedItemList.push(updatedItem)
    }

    return { insertedOrder, updatedItemList }
  } catch (error) {
    throw error
  }
}

const getAllOrders = async (buyerId) => {
  try {
    const result = await orderModel.getAllOrders(buyerId)
    return result
  } catch (error) {
    throw error
  }
}

// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------

/**
 * Seller APIs
 * @author taiki and levi
 */
const seller_getAllOrders = async (sellerId) => {
  try {
    const result = await orderModel.seller_getAllOrders(sellerId)
    return result
  } catch (error) {
    throw error
  }
}

const seller_updateOrderStatus = async (reqBody) => {
  try {
    const { orderId, status } = reqBody
    const updatedOrder = await orderModel.seller_updateOrderStatus(orderId, status)

    if (status === ORDER_STATUS.SHIPPING) {
      // --------------------Xử lí API Create Order GHN---------------------------
      const order = await orderModel.findOneById(orderId)
      if (!order)
        throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Đơn hàng không hợp lệ')
      const {
        sellerId,
        shopId,
        finalPrice,
        buyerPhone,
        buyerName,
        note,
        buyerAddress,
        shippingFee,
        itemList
      } = order
      const seller = await sellerModel.findOneById(sellerId)
      const sellerName = seller.name

      // Xử lí thông tin shop
      const shop = await shopModel.findOneById(shopId)
      const shopAddress = shop.shopAddress
      const shopPhone = shop.phone

      // Thông tin chưa được xử lí
      let insuranceValue = 0
      let coupon = ''
      let content = ''
      let paymentTypeId = 2
      let requiredNote = 'KHONGCHOXEMHANG'

      // Xử lí thông số đơn hàng
      const totalWeight = itemList.reduce((sum, item) => sum + item._weight, 0)
      const orderLength = Math.max(itemList.map((item) => item._length))
      const orderWidth = Math.max(itemList.map((item) => item._width))
      const orderHeight = itemList.reduce((sum, item) => sum + item._height, 0)

      let GHNdata
      if (
        totalWeight > 50000 ||
        orderLength > 200 ||
        orderWidth > 200 ||
        orderHeight > 200
      ) {
        // Hàng nặng
        const serviceTypeId = 5
        // Xử lí itemList
        const Items = itemList.map((item) => {
          return {
            name: `${item.productName} - ${item.typeName}`,
            code: item.productId,
            quantity: item.quantity,
            price: item.price,
            length: item._length,
            weight: item._weight,
            width: item._width,
            height: item._height
          }
        })
        GHNdata = {
          from_name: sellerName,
          from_phone: shopPhone,
          from_address: shopAddress.address,
          from_ward_name: shopAddress.ward,
          from_district_name: shopAddress.district,
          from_province_name: shopAddress.province,
          to_name: buyerName,
          to_phone: buyerPhone,
          to_address: buyerAddress.address,
          to_ward_name: buyerAddress.ward,
          to_district_name: buyerAddress.district,
          to_province_name: buyerAddress.province,
          return_phone: shopPhone,
          return_address: shopAddress.address,
          return_district_name: shopAddress.district,
          return_ward_name: shopAddress.ward,
          return_province_name: shopAddress.province,
          cod_amount: finalPrice - shippingFee,
          content: content,
          insurance_value: insuranceValue,
          coupon: coupon,
          service_type_id: serviceTypeId,
          payment_type_id: paymentTypeId,
          note: note,
          required_note: requiredNote,
          Items: Items
        }
      } else {
        // Hàng nhẹ
        const serviceTypeId = 2
        GHNdata = {
          from_name: sellerName,
          from_phone: shopPhone,
          from_address: shopAddress.address,
          from_ward_name: shopAddress.ward,
          from_district_name: shopAddress.district,
          from_province_name: shopAddress.province,
          to_name: buyerName,
          to_phone: buyerPhone,
          to_address: buyerAddress.address,
          to_ward_name: buyerAddress.ward,
          to_district_name: buyerAddress.district,
          to_province_name: buyerAddress.province,
          return_phone: shopPhone,
          return_address: shopAddress.address,
          return_district_name: shopAddress.district,
          return_ward_name: shopAddress.ward,
          return_province_name: shopAddress.province,
          cod_amount: finalPrice - shippingFee,
          content: content,
          weight: totalWeight,
          length: orderLength,
          width: orderWidth,
          height: orderHeight,
          insurance_value: insuranceValue,
          coupon: coupon,
          service_type_id: serviceTypeId,
          payment_type_id: paymentTypeId,
          note: note,
          required_note: requiredNote
        }
      }
      const validGHNdata = await GHNProvider.GHN_ORDER_SCHEMA.validateAsync(
        GHNdata,
        { abortEarly: false }
      )

      const createdGHNOrder = await createGHNOrder(validGHNdata)
      return { updatedOrder, createdGHNOrder }
    }

    return updatedOrder
  } catch (error) {
    throw error
  }
}

export const orderService = {
  // Buyer
  addOrder,
  clusterOrder,
  getAllOrders,

  // Seller
  seller_getAllOrders,
  seller_updateOrderStatus
}
