import { StatusCodes } from 'http-status-codes'
import { productService } from '~/services/productService'

const getProducts = async (req, res, next) => {
  try {
    const listProducts = await productService.getProducts()

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

export const productController = {
  getProducts,
  createProduct,
  getDetails
}