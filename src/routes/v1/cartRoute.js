import express from 'express'
import { cartController } from '~/controllers/cartController'

const Router = express.Router()

Router.route('/')
  .get(cartController.getCart)

export const cartRoute = Router