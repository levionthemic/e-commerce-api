import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { productRoute } from './productRoute'
import { categoryRoute } from './categoryRoute'
import { authRoute } from './authRoute'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({
    message: 'APIs V1 are ready to use'
  })
})

/* Buyer APIs */
Router.use('/products', authMiddleware.isAuthorized, productRoute)
Router.use('/categories', authMiddleware.isAuthorized, categoryRoute)
Router.use('/auth', authRoute)

/* Seller APIs */

/* Admin APIs */

export const APIs_V1 = Router