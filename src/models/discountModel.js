import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'



const DISCOUNT_COLLECTION_NAME = 'discounts'
const DISCOUNT_COLLECTION_SCHEMA = Joi.object({
  name: Joi.string().required().trim().strict(),
  description: Joi.string(),
  discount: Joi.number().required(),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _deleted: Joi.boolean().default(false)
})

export const discountModel = {
  DISCOUNT_COLLECTION_NAME,
  DISCOUNT_COLLECTION_SCHEMA
}