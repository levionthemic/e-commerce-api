import Joi from 'joi'
import { ObjectId } from 'mongodb'
import unidecode from 'unidecode'
import { GET_DB } from '~/config/mongodb'
import { pagingSkipValue } from '~/utils/algorithms'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const PRODUCT_COLLECTION_NAME = 'products'
const PRODUCT_COLLECTION_SCHEMA = Joi.object({
  sellerId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  shopId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).default(null),
  name: Joi.string().required().trim().strict(),
  categoryId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  brandId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  description: Joi.string(),
  features: Joi.array().items({
    field: Joi.string().required().trim().strict(),
    content: Joi.string().trim().strict()
  }),
  discount: Joi.number().default(0),
  avgPrice: Joi.number().default(0),
  medias: Joi.array().items(Joi.string()),
  avatar: Joi.string(),
  rating: Joi.number().default(0),
  sold: Joi.number().default(0),
  typeCount: Joi.number().default(1),
  score: Joi.number().default(0),
  slug: Joi.string().required().trim().strict(),
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

          queryConditions.push({
            $or: [
              { [key]: { $regex: new RegExp(queryFilters[key], 'i') } },
              { slug: { $regex: regexSlug } }
            ]
          })
        }
      })
    }

    const query = await GET_DB().collection(PRODUCT_COLLECTION_NAME).aggregate(
      [
        { $match: { $and: queryConditions } },
        // { $sort: { name: 1 } },
        {
          $facet: {
            'queryProducts': [
              { $skip: pagingSkipValue(page, itemsPerPage) },
              { $limit: itemsPerPage }
            ],
            'queryTotalProducts': [{ $count: 'totalProductsCount' }]
          }
        }
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


export const productModel = {
  PRODUCT_COLLECTION_NAME,
  PRODUCT_COLLECTION_SCHEMA,
  getProducts,
  createProduct,
  getDetails
}