import { cloneDeep } from 'lodash'
import { brandModel } from '~/models/brandModel'
import { buyerModel } from '~/models/buyerModel'
import { categoryModel } from '~/models/categoryModel'
import { productModel } from '~/models/productModel'
import { sellerModel } from '~/models/sellerModel'
import { DEFAULT_ITEMS_PER_PAGE } from '~/utils/constants'
import { slugify } from '~/utils/formatters'

/**
 * Buyer APIs
 * @author levi
 */
/* eslint-disable no-useless-catch */
const getProducts = async (page, itemsPerPage, queryFilters, filterMode = false) => {
  try {
    if (!page) page = 1
    if (!itemsPerPage) itemsPerPage = DEFAULT_ITEMS_PER_PAGE

    let results = await productModel.getProducts(page, itemsPerPage, queryFilters)

    results.products = await Promise.all(results.products.map(async product => {
      // Handle types
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

      // Handle category, brand and seller
      const category = await categoryModel.findOneById(product.categoryId)
      const brand = await brandModel.findOneById(product.brandId)
      const seller = await sellerModel.findOneById(product.sellerId)

      product.category = category
      product.brand = brand
      product.seller = seller

      delete product['categoryId']
      delete product['brandId']
      delete product['sellerId']

      return product
    }))

    // Get all categories and brands for filter data
    if (!filterMode) {
      const categories = [...new Map(
        results.products.map(product => [product?.category?._id.toString(), product?.category])
      ).values()]
      results.categories = categories

      const brands = [...new Map(
        results.products.map(product => [product?.brand?._id.toString(), product?.brand])
      ).values()]
      results.brands = brands
    }

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

    // Handle type
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

    // Handle category, brand and seller
    const category = await categoryModel.findOneById(product.categoryId)
    const brand = await brandModel.findOneById(product.brandId)
    const seller = await sellerModel.findOneById(product.sellerId)

    product.category = category
    product.brand = brand
    product.seller = seller

    delete product['categoryId']
    delete product['brandId']
    delete product['sellerId']

    // Handle reviews
    if (product?.reviews && product?.reviews.length > 0) {
      let result = []
      for (let reviews of product.reviews) {
        const comments = reviews.comments
        const res = await Promise.all(comments?.map(comment => buyerModel.findOneById(comment.buyerId)))
        reviews.comments = comments.map((comment, index) => ({ ...comment, buyerName: res[index]?.username, buyerAvatar: res[index]?.avatar }))
        result.push(reviews)
      }
      product.reviews = result
    }

    return product
  } catch (error) { throw error }
}

// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------

/**
 * Seller APIs
 * @author taiki and levi
 */
const seller_getProducts = async (sellerId, page, itemsPerPage, queryFilters, filterMode = false) => {
  try {
    if (!page) page = 1
    if (!itemsPerPage) itemsPerPage = DEFAULT_ITEMS_PER_PAGE

    let results = await productModel.seller_getProducts(sellerId, page, itemsPerPage, queryFilters)

    results.products = await Promise.all(results.products.map(async product => {
      // Handle types
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

      // Handle category, brand and seller
      const category = await categoryModel.findOneById(product.categoryId)
      const brand = await brandModel.findOneById(product.brandId)
      const seller = await sellerModel.findOneById(product.sellerId)

      product.category = category
      product.brand = brand
      product.seller = seller

      delete product['categoryId']
      delete product['brandId']
      delete product['sellerId']

      return product
    }))

    // Get all categories and brands for filter data
    if (filterMode) {
      const categories = [...new Map(
        results.products.map(product => [product?.category?._id.toString(), product?.category])
      ).values()]
      results.categories = categories

      const brands = [...new Map(
        results.products.map(product => [product?.brand?._id.toString(), product?.brand])
      ).values()]
      results.brands = brands
    }

    return results
  } catch (error) { throw error }
}

export const productService = {
  getProducts,
  createProduct,
  getDetails,

  // Seller
  seller_getProducts
}