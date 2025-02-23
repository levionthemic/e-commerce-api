import express from 'express'
import { cartController } from '~/controllers/cartController'

const Router = express.Router()

Router.route('/')
  .get(cartController.getCarts)

export const cartRoute = Router