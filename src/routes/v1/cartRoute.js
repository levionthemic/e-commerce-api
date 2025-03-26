import express from 'express'
import { cartController } from '~/controllers/cartController'
import { cartValidation } from '~/validations/cartValidation'

const Router = express.Router()

Router.route('/')
  .get(cartController.getCart)

Router.route('/add')
  .post(cartValidation.addToCart, cartController.addToCart)

Router.route('/update')
  .put(cartValidation.update, cartController.update)

Router.route('/delete')
  .put(cartController.deleteItem)

export const cartRoute = Router