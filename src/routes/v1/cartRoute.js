import express from 'express'
import { cartController } from '~/controllers/cartController'
import { cartValidation } from '~/validations/cartValidation'

const Router = express.Router()

Router.route('/')
  .get(cartController.getCart)

Router.route('/add')
  .post(cartValidation.addToCart, cartController.addToCart)

export const cartRoute = Router