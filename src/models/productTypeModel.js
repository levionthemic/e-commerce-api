import Joi from 'joi'
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

export const productTypeModel = {
  PRODUCT_TYPE_COLLECTION_NAME,
  PRODUCT_TYPE_COLLECTION_SCHEMA
}