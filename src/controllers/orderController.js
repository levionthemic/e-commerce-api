import { StatusCodes } from 'http-status-codes'
import { orderService } from '~/services/orderService'

/**
 * Buyer APIs
 * @author taiki and levi
 */
const clusterOrder = async (req, res, next) => {
  try {
    const buyerId = req.jwtDecoded._id

    const clusteredOrderList = await orderService.clusterOrder(
      buyerId,
      req.body
    )

    res.status(StatusCodes.OK).json(clusteredOrderList)
  } catch (error) {
    next(error)
  }
}

const addOrder = async (req, res, next) => {
  try {
    const buyerId = req.jwtDecoded._id

    const buyNow = req.query.buyNow ? true : false

    const insertedOrder = await orderService.addOrder(buyerId, req.body, buyNow)

    res.status(StatusCodes.OK).json(insertedOrder)
  } catch (error) {
    next(error)
  }
}

const getAllOrders = async (req, res, next) => {
  try {
    const buyerId = req.jwtDecoded._id

    const listOrders = await orderService.getAllOrders(buyerId)

    res.status(StatusCodes.OK).json(listOrders)
  } catch (error) {
    next(error)
  }
}

// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------

/**
 * Seller APIs
 * @author taiki and levi
 */
const seller_getAllOrders = async (req, res, next) => {
  try {
    const sellerId = req.jwtDecoded._id
    const isLatest = req.query.latest ? true : false

    const listOrders = await orderService.seller_getAllOrders(sellerId, isLatest)

    res.status(StatusCodes.OK).json(listOrders)
  } catch (error) {
    next(error)
  }
}

const seller_updateOrderStatus = async (req, res, next) => {
  try {
    const updatedOrder = await orderService.seller_updateOrderStatus(req.body)

    res.status(StatusCodes.OK).json(updatedOrder)
  } catch (error) {
    next(error)
  }
}

export const orderController = {
  // Buyer
  addOrder,
  clusterOrder,
  getAllOrders,

  // Seller
  seller_getAllOrders,
  seller_updateOrderStatus
}
