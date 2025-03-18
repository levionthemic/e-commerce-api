import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'



const PRODUCT_COLLECTION_NAME = 'products'
const PRODUCT_COLLECTION_SCHEMA = Joi.object({
  sellerId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  name: Joi.string().required().trim().strict(),
  categoryId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  brandId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  description: Joi.string(),
  features: Joi.array().items({
    field: Joi.string().required().trim().strict(),
    content: Joi.string().trim().strict()
  }),
  discount: Joi.number().default(0),
  minPrice: Joi.number().default(0),
  maxPrice: Joi.number().default(0),
  avgPrice: Joi.number().default(0),
  totalStock: Joi.number().default(0),
  medias: Joi.array().items(Joi.string()),
  avatar: Joi.string(),
  rating: Joi.number().default(0),
  sold: Joi.number().default(0),
  score: Joi.number().default(0),
  slug: Joi.string().required().trim().strict(),
  types: Joi.array().items({ typeId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE) }),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _deleted: Joi.boolean().default(false)
})

export const productModel = {
  PRODUCT_COLLECTION_NAME,
  PRODUCT_COLLECTION_SCHEMA
}