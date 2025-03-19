import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { EMAIL_RULE, EMAIL_RULE_MESSAGE, OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const PRODUCT_TYPE_COLLECTION_NAME = 'productTypes'
const PRODUCT_TYPE_COLLECTION_SCHEMA = Joi.object({
  productId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  shopId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).default(null),
  types: Joi.array().items({
    typeId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    name: Joi.string().required().trim().strict(),
    price: Joi.number().default(0),
    stock: Joi.number().default(0),
    createdAt: Joi.date().timestamp('javascript').default(Date.now),
    updatedAt: Joi.date().timestamp('javascript').default(null),
    _deleted: Joi.boolean().default(false)
  }),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _deleted: Joi.boolean().default(false)
})

const findOneByProductId = async (productId) => {
  try {
    const user = await GET_DB().collection(PRODUCT_TYPE_COLLECTION_NAME).findOne({ productId: new ObjectId(productId) })
    return user
  } catch (error) { throw new Error(error) }
}

export const productTypeModel = {
  PRODUCT_TYPE_COLLECTION_NAME,
  PRODUCT_TYPE_COLLECTION_SCHEMA,
  findOneByProductId
}