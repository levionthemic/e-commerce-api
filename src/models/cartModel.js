import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
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

const getCarts = async (userId) => {
  try {
    const result = await GET_DB().collection(CART_COLLECTION_NAME).find({ userId: new ObjectId(userId) }).toArray()
    return result
  } catch (error) { throw new Error(error) }
}

export const cartModel = {
  CART_COLLECTION_NAME,
  CART_COLLECTION_SCHEMA,
  getCarts
}