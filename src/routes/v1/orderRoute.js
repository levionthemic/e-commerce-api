import express from 'express'
import { orderController } from '~/controllers/orderController'
import { orderValidation } from '~/validations/orderValidation'

const Router = express.Router()

/**
 * Buyer APIs
 * @author taiki and levi
 */
Router.route('/cluster').post(
  orderValidation.clusterOrder,
  orderController.clusterOrder
)

Router.route('/add').post(orderValidation.addOrder, orderController.addOrder)

Router.route('/get-all').get(orderController.getAllOrders)

// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------

/**
 * Seller APIs
 * @author taiki and levi
 */
Router.route('/seller/get-all').get(orderController.seller_getAllOrders)

Router.route('/seller/update-status').post(
  orderValidation.updateOrderStatus,
  orderController.seller_updateOrderStatus
)

export const orderRoute = Router
