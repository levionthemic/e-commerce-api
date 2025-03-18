/* eslint-disable no-useless-catch */
import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { EMAIL_RULE, EMAIL_RULE_MESSAGE, OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { pagingSkipValue } from '~/utils/algorithms'
import unidecode from 'unidecode'

const PRODUCT_COLLECTION_NAME = 'products'
const PRODUCT_COLLECTION_SCHEMA = Joi.object({
  name: Joi.string().required().trim().strict(),
  slug: Joi.string().required().trim().strict(),
  price: Joi.number().required().min(0),
  discountPercentage: Joi.number().min(0).max(100),
  rate: Joi.number().required().min(0).max(5),
  thumbnailUrl: Joi.string().required(),
  description: Joi.string().min(0),
  quantityInStock: Joi.number().required().min(0),
  quantitySold: Joi.number().min(0),
  categoryId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),

  // Comments
  comments: Joi.array().items({
    userId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    userEmail: Joi.string().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
    userAvatar: Joi.string(),
    userDisplayName: Joi.string(),
    content: Joi.string(),
    commentedAt: Joi.date().timestamp()
  }).default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _deleted: Joi.boolean().default(false)
})

const getProducts = async (page, itemsPerPage, queryFilters) => {
  try {
    const queryConditions = [{ _deleted: false }]

    if (queryFilters) {
      Object.keys(queryFilters).forEach(key => {
        if (key === 'name') {
          const slug = unidecode(queryFilters[key]).trim().replace(/\s+/g, '-')
          const regexSlug = new RegExp(slug, 'i')

          queryConditions.push({ $or: [
            { [key]: { $regex: new RegExp(queryFilters[key], 'i') } },
            { slug: { $regex: regexSlug } }
          ] })
        }
      })
    }

    const query = await GET_DB().collection(PRODUCT_COLLECTION_NAME).aggregate(
      [
        { $match: { $and: queryConditions } },
        // { $sort: { name: 1 } },
        { $facet: {
          'queryProducts': [
            { $skip: pagingSkipValue(page, itemsPerPage) },
            { $limit: itemsPerPage }
          ],
          'queryTotalProducts': [{ $count: 'totalProductsCount' }]
        } }
      ],
      { collation: { locale: 'en' } }
    ).toArray()

    const res = query[0]

    return {
      products: res.queryProducts || [],
      totalProducts: res.queryTotalProducts[0]?.totalProductsCount || 0
    }
  } catch (error) { throw new Error(error) }
}

const createProduct = async (productData) => {
  try {
    const validData = await PRODUCT_COLLECTION_SCHEMA.validateAsync(productData, { abortEarly: false })
    return await GET_DB().collection('product2').insertOne(validData)
  } catch (error) { throw new Error(error) }
}

const getDetails = async (productId) => {
  try {
    const result = await GET_DB().collection(PRODUCT_COLLECTION_NAME).findOne({
      _id: new ObjectId(productId)
    })
    return result
  } catch (error) { throw new Error(error) }
}

const unshiftNewComment = async (productId, commentToAdd) => {
  try {
    const result = await GET_DB().collection(PRODUCT_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(productId) },
      { $push: { comments: { $each: [commentToAdd], $position: 0 } } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw new Error(error) }
}

export const productModel = {
  PRODUCT_COLLECTION_NAME,
  PRODUCT_COLLECTION_SCHEMA,
  getProducts,
  createProduct,
  getDetails,
  unshiftNewComment
}