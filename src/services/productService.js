import { cloneDeep } from 'lodash'
import { buyerModel } from '~/models/buyerModel'
import { productModel } from '~/models/productModel'
import { DEFAULT_ITEMS_PER_PAGE } from '~/utils/constants'
import { slugify } from '~/utils/formatters'

/* eslint-disable no-useless-catch */
const getProducts = async (page, itemsPerPage, queryFilters) => {
  try {
    if (!page) page = 1
    if (!itemsPerPage) itemsPerPage = DEFAULT_ITEMS_PER_PAGE

    const results = await productModel.getProducts(page, itemsPerPage, queryFilters)
    results.products.map(result => {
      const product = result
      const types = cloneDeep(product?.typeFeature)
      if (types) {
        types.map(type => {
          const stock = product.shopTypes?.reduce((sum, item) => {
            const foundType = item.types.find(t => t.typeId.toString() === type.typeId.toString())
            if (foundType) return sum + foundType.stock
            return sum
          }, 0)
          type.stock = stock
          return type
        })
      }
      product.types = types
      delete product['shopTypes']
      delete product['typeFeature']

      return product
    })
    return results
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
    const types = cloneDeep(product?.typeFeature)
    if (types) {
      types.map(type => {
        const stock = product.shopTypes?.reduce((sum, item) => {
          const foundType = item.types.find(t => t.typeId.toString() === type.typeId.toString())
          if (foundType) return sum + foundType.stock
          return sum
        }, 0)
        type.stock = stock
        return type
      })
    }
    product.types = types

    if (product?.comments && product?.comments.length > 0) {
      product.comments = product?.comments[0].comments

      delete product['shopTypes']
      delete product['typeFeature']

      const res = await Promise.all(product?.comments?.map(comment => buyerModel.findOneById(comment.buyerId)))

      product.comments = product.comments.map((comment, index) => ({ ...comment, buyerName: res[index]?.username }))
    }

    return product
  } catch (error) { throw error }
}

export const productService = {
  getProducts,
  createProduct,
  getDetails
}