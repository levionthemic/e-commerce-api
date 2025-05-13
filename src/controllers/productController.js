import { StatusCodes } from 'http-status-codes'
import { productService } from '~/services/productService'

/**
 * Buyer APIs
 * @author taiki and levi
 */
const getProducts = async (req, res, next) => {
  try {
    const { page, itemsPerPage, q } = req.query
    const queryFilters = q
    const listProducts = await productService.getProducts(page, itemsPerPage, queryFilters)

    res.status(StatusCodes.OK).json(listProducts)
  } catch (error) { next(error) }
}

const getProductsWithFilters = async (req, res, next) => {
  try {
    const { page, itemsPerPage, q } = req.query
    const queryFilters = q
    const listProducts = await productService.getProducts(page, itemsPerPage, queryFilters, true)

    res.status(StatusCodes.OK).json(listProducts)
  } catch (error) { next(error) }
}

const createProduct = async (req, res, next) => {
  try {
    const createdProduct = await productService.createProduct({ ...req.body })

    res.status(StatusCodes.CREATED).json(createdProduct)
  } catch (error) { next(error) }
}

const getDetails = async (req, res, next) => {
  try {
    const productId = req.params?.id
    const product = await productService.getDetails(productId)

    res.status(StatusCodes.OK).json(product)
  } catch (error) { next(error) }
}

const update = async (req, res, next) => {
  try {
    const productId = req.params?.id
    const userInfo = req.jwtDecoded
    const updatedProduct = await productService.update(productId, req.body, userInfo)

    res.status(StatusCodes.OK).json(updatedProduct)
  } catch (error) { next(error) }
}

// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------

/**
 * Seller APIs
 * @author taiki and levi
 */
const seller_getProducts = async (req, res, next) => {
  try {
    const sellerId = req.jwtDecoded._id
    const { page, itemsPerPage, q } = req.query
    const queryFilters = q
    const listProducts = await productService.seller_getProducts(sellerId, page, itemsPerPage, queryFilters)

    res.status(StatusCodes.OK).json(listProducts)
  } catch (error) { next(error) }
}

export const productController = {
  // Buyer
  getProducts,
  getProductsWithFilters,
  createProduct,
  getDetails,
  update,

  // Seller
  seller_getProducts
}