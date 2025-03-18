import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { pipeline } from 'nodemailer/lib/xoauth2'
import { GET_DB } from '~/config/mongodb'
import { productModel } from '~/models/productModel'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const CART_COLLECTION_NAME = 'carts'
const CART_COLLECTION_SCHEMA = Joi.object({
  userId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  products: Joi.array().items(
    {
      productId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
      quantity: Joi.number().default(1)
    }
  )
})

const getCart = async (userId) => {
  try {
    const result = await GET_DB().collection(CART_COLLECTION_NAME).aggregate([
      { $match: { userId: new ObjectId(userId) } },
      { $lookup: {
        from: productModel.PRODUCT_COLLECTION_NAME,
        localField: 'products.productId',
        foreignField: '_id',
        as: 'fullProducts',
        pipeline: [{ $project : { 'slug': 0, 'discountPercentage': 0, 'rate': 0, 'description': 0, 'quantityInStock': 0, 'quantitySold': 0, 'primaryCategoryPath': 0, 'createdAt': 0 } }]
      } }
    ]).toArray()
    return result[0] || null
  } catch (error) { throw new Error(error) }
}

export const cartModel = {
  CART_COLLECTION_NAME,
  CART_COLLECTION_SCHEMA,
  getCart
}