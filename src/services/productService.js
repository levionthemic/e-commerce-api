import { productModel } from '~/models/productModel'
import { slugify } from '~/utils/formatters'

/* eslint-disable no-useless-catch */
const getProducts = async () => {
  try {
    const listProducts = await productModel.getProducts()
    return listProducts || []
  } catch (error) { throw error }
}

const createProduct = async (reqBody) => {
  try {
    const createdProduct = await productModel.createProduct({ ...reqBody, slug: slugify(reqBody.name) })
    return createdProduct
  } catch (error) { throw error }
}

const getDetails = async (productId) => {
  try {
    const product = await productModel.getDetails(productId)
    return product
  } catch (error) { throw error }
}

const update = async (productId, reqBody, userInfo) => {
  try {
    let updatedProduct = {}

    if (reqBody?.commentToAdd) {
      // Add Comment
      const newCommentData = {
        ...reqBody.commentToAdd,
        userId: userInfo._id,
        userEmail: userInfo.email,
        commentedAt: Date.now()
      }

      updatedProduct = await productModel.unshiftNewComment(productId, newCommentData)
    }

    return updatedProduct
  } catch (error) { throw error }
}

export const productService = {
  getProducts,
  createProduct,
  getDetails,
  update
}