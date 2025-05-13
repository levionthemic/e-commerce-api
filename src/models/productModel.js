import Joi from 'joi'
import { ObjectId } from 'mongodb'
import unidecode from 'unidecode'
import { GET_DB } from '~/config/mongodb'
import { reviewModel } from '~/models/reviewModel'
import { pagingSkipValue } from '~/utils/algorithms'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const PRODUCT_COLLECTION_NAME = 'products'
const PRODUCT_COLLECTION_SCHEMA = Joi.object({
  sellerId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  name: Joi.string().required().trim().strict(),
  categoryId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).default(null),
  brandId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).default(null),
  description: Joi.string(),
  features: Joi.array().items({
    field: Joi.string().required().trim().strict(),
    content: Joi.string().trim().strict()
  }),
  avgPrice: Joi.number().default(0),
  medias: Joi.array().items(Joi.string()),
  avatar: Joi.string(),
  rating: Joi.number().default(0),
  sold: Joi.number().default(0),
  score: Joi.number().default(0),
  slug: Joi.string().required().trim().strict(),
  typeFeature: Joi.array().items({
    typeId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    typeName: Joi.string().required().trim().strict(),
    discount: Joi.number().default(0),
    price: Joi.number().default(0),
    _weight: Joi.number(),
    _length: Joi.number(),
    _width: Joi.number(),
    _height: Joi.number()
  }),
  shopTypes: Joi.array().items({
    shopId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    types: Joi.array().items({
      typeId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
      stock: Joi.number().default(0)
    })
  }),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _deleted: Joi.boolean().default(false)
})

const INVALID_UPDATE_FIELDS = ['sellerId']

/**
 * Buyer APIs
 * @author taiki and levi
 */
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
        if (key === 'rating') queryConditions.push({ [key]: { $gt: parseInt(queryFilters[key]) - 1 } })
        if (key === 'minPrice') queryConditions.push({ avgPrice: { $gt: parseInt(queryFilters[key]) } })
        if (key === 'maxPrice') queryConditions.push({ avgPrice: { $lt: parseInt(queryFilters[key]) } })
        if (key === 'categoryId') queryConditions.push({ [key]: new ObjectId(queryFilters[key]) })
        if (key === 'brandId') queryConditions.push({ [key]: new ObjectId(queryFilters[key]) })
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

    return {
      products: query[0].queryProducts || [],
      totalProducts: query[0].queryTotalProducts[0]?.totalProductsCount || 0
    }
  } catch (error) { throw new Error(error) }
}

const createProduct = async (productData) => {
  try {
    const validData = await PRODUCT_COLLECTION_SCHEMA.validateAsync(productData, { abortEarly: false })
    return await GET_DB().collection('product2').insertOne(validData)
  } catch (error) { throw new Error(error) }
}

const findOneById = async (id) => {
  try {
    const user = await GET_DB().collection(PRODUCT_COLLECTION_NAME).findOne({ _id: new ObjectId(id) })
    return user
  } catch (error) { throw new Error(error) }
}

const getDetails = async (productId) => {
  try {
    const result = await GET_DB().collection(PRODUCT_COLLECTION_NAME).aggregate([
      { $match: { _id: new ObjectId(productId) } },
      { $lookup: {
        from: reviewModel.REVIEW_COLLECTION_NAME,
        localField: '_id',
        foreignField: 'productId',
        as: 'reviews'
      } }
    ]).toArray()
    return result[0] || null
  } catch (error) { throw new Error(error) }
}


const update = async (productId, productData) => {
  try {
    Object.keys(productData).forEach(fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete productData[fieldName]
      }
    })

    const updatedProduct = await GET_DB().collection(PRODUCT_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(productId) },
      { $set: productData },
      { returnDocument: 'after' }
    )
    return updatedProduct
  } catch (error) { throw new Error(error) }
}

const increaseStock = async (productId, typeId, shopId, quantity) => {
  try {
    const result = await GET_DB().collection(PRODUCT_COLLECTION_NAME).findOneAndUpdate(
      { $and: [
        { _id: new ObjectId(productId) },
        { 'shopTypes.shopId': new ObjectId(shopId) },
        { 'shopTypes.types.typeId': new ObjectId(typeId) }
      ] },
      { $inc: { 'shopTypes.$[shop].types.$[type].stock': quantity } },
      {
        arrayFilters: [
          { 'shop.shopId': new ObjectId(shopId) },
          { 'type.typeId': new ObjectId(typeId) }
        ]
      }
    )
    return result
  } catch (error) { throw new Error(error) }
}

// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------

/**
 * Seller APIs
 * @author taiki and levi
 */
const seller_getProducts = async (sellerId, page, itemsPerPage, queryFilters) => {
  try {
    const queryConditions = [{ sellerId: new ObjectId(sellerId), _deleted: false }]

    let sortStatement = null

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
        if (key === 'rating') queryConditions.push({ [key]: { $gt: parseInt(queryFilters[key]) - 1 } })
        if (key === 'minPrice') queryConditions.push({ avgPrice: { $gt: parseInt(queryFilters[key]) } })
        if (key === 'maxPrice') queryConditions.push({ avgPrice: { $lt: parseInt(queryFilters[key]) } })
        if (key === 'categoryId') queryConditions.push({ [key]: new ObjectId(queryFilters[key]) })
        if (key === 'brandId') queryConditions.push({ [key]: new ObjectId(queryFilters[key]) })

        if (key === 'sold') sortStatement = { $sort: { sold: parseInt(queryFilters[key]) } }
      })
    }

    const pipeline = []
    pipeline.push( { $match: { $and: queryConditions } })
    if (sortStatement) pipeline.push(sortStatement)

    const query = await GET_DB().collection(PRODUCT_COLLECTION_NAME).aggregate(
      [
        ...pipeline,
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

    return {
      products: query[0].queryProducts || [],
      totalProducts: query[0].queryTotalProducts[0]?.totalProductsCount || 0
    }
  } catch (error) { throw new Error(error) }
}

export const productModel = {
  PRODUCT_COLLECTION_NAME,
  PRODUCT_COLLECTION_SCHEMA,

  // Buyer
  getProducts,
  createProduct,
  getDetails,
  findOneById,
  update,
  increaseStock,

  // Seller
  seller_getProducts
}