import express from 'express'
import { orderController } from '~/controllers/orderController'
import { orderValidation } from '~/validations/orderValidation'

const Router = express.Router()

Router.route('/cluster')
  .post(orderValidation.clusterOrder, orderController.clusterOrder)

Router.route('/add')
  .post(orderValidation.addOrder, orderController.addOrder)

Router.route('/get-all')
  .get(orderController.getAllOrdersForBuyer)

Router.route('/seller/get-all')
  .get(orderController.getAllOrdersForSeller)

Router.route('/update-status')
  .post(orderValidation.updateOrderStatus, orderController.updateOrderStatus)


export const orderRoute = Router
