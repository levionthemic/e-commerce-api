import express from 'express'
import { productController } from '~/controllers/productController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { productValidation } from '~/validations/productValidation'

const Router = express.Router()

/**
 * Buyer APIs
 * @author taiki and levi
 */
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

// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------

/**
 * Seller APIs
 * @author taiki and levi
 */
Router.route('/seller/get-all')
  .get(authMiddleware.isAuthorized, productController.seller_getProducts)

export const productRoute = Router