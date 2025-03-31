import express from 'express'
import { orderController } from '~/controllers/orderController'
import { orderValidation } from '~/validations/orderValidation'

const Router = express.Router()

Router.route('/cluster')
  .post(orderValidation.clusterOrder, orderController.clusterOrder)

Router.route('/add')
  .post(orderValidation.addOrder, orderController.addOrder)


export const orderRoute = Router