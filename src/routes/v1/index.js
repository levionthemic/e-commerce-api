import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { productRoute } from './productRoute'

const Router = express.Router()

Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({
    message: 'APIs V1 are ready to use'
  })
})

/* Buyer APIs */
Router.use('/products', productRoute)

/* Seller APIs */

/* Admin APIs */

export const APIs_V1 = Router