import express from 'express'
import { productController } from '~/controllers/productController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { productValidation } from '~/validations/productValidation'

const Router = express.Router()

Router.route('/')
  .get(productController.getProducts)
  .post(authMiddleware.isAuthorized, productValidation.createProduct)

Router.route('/filter')
  .get(productController.getProductsWithFilters)

// Router.route('/search')
//   .get(productController.searchProducts)

Router.route('/:id')
  .get(productController.getDetails)
  .put(authMiddleware.isAuthorized, productValidation.update, productController.update)
//   .delete(productController.deleteProduct)

export const productRoute = Router