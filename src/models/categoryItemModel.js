import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'



const CATEGORY_ITEM_COLLECTION_NAME = 'categoryItems'
const CATEGORY_ITEM_COLLECTION_SCHEMA = Joi.object({
  categoryId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  parentCategoryId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).default(null),
  page: Joi.number().default(1),
  count: Joi.number().default(0),
  itemList: Joi.array().items({
    productId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  }),
  
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _deleted: Joi.boolean().default(false)
})

export const categoryItemModel = {
  CATEGORY_ITEM_COLLECTION_NAME,
  CATEGORY_ITEM_COLLECTION_SCHEMA
}