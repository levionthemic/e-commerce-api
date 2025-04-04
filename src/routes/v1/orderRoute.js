import express from 'express'
import { orderController } from '~/controllers/orderController'
import { orderValidation } from '~/validations/orderValidation'

const Router = express.Router()

Router.route('/cluster')
  .post(orderValidation.clusterOrder, orderController.clusterOrder)

Router.route('/add')
  .post(orderValidation.addOrder, orderController.addOrder)

Router.route('/seller/get-all')
  .get(orderController.getAllOrdersForSeller)
export const orderRoute = Router