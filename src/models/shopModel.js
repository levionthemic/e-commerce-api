import Joi from 'joi'
import { EMAIL_RULE, EMAIL_RULE_MESSAGE, OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const SHOP_COLLECTION_NAME = 'shops'
const SHOP_COLLECTION_SCHEMA = Joi.object({
  sellerId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  email: Joi.string().required().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
  phone: Joi.string().required(),
  address: Joi.array().items({
    province: Joi.string().required().trim().strict(),
    district: Joi.string().required().trim().strict(),
    ward: Joi.string().required().trim().strict(),
    detail: Joi.string().required().trim().strict()
  }),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _deleted: Joi.boolean().default(false)
})

export const shopModel = {
  SHOP_COLLECTION_NAME,
  SHOP_COLLECTION_SCHEMA
}