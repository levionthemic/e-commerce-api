import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const SELLER_ITEM_COLLECTION_NAME = 'sellerItems'
const SELLER_ITEM_COLLECTION_SCHEMA = Joi.object({
  sellerId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  itemList: Joi.array().items(
    {
      productId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
      createdAt: Joi.date().timestamp('javascript').default(Date.now),
      updatedAt: Joi.date().timestamp('javascript').default(null),
      _deleted: Joi.boolean().default(false)
    }
  ),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _deleted: Joi.boolean().default(false)
})

export const sellerItemModel = {
  SELLER_ITEM_COLLECTION_NAME,
  SELLER_ITEM_COLLECTION_SCHEMA
}