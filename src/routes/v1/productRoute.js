import express from 'express'
import { productController } from '~/controllers/productController'
import { productValidation } from '~/validations/productValidation'

const Router = express.Router()

Router.route('/')
  .get(productController.getProducts)
  .post(productValidation.createProduct)

// Router.route('/search')
//   .get(productController.searchProducts)

Router.route('/:id')
  .get(productController.getDetails)
//   .put(productValidation.updateProduct, productController.updateProduct)
//   .delete(productController.deleteProduct)

export const productRoute = Router