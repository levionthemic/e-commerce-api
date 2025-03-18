import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'



const SELLER_ACCOUNT_COLLECTION_NAME = 'sellerAccounts'
const SELLER_ACCOUNT_COLLECTION_SCHEMA = Joi.object({
  page: Joi.number().default(1),
  count: Joi.number().default(0),
  accountList: Joi.array().items({
    sellerId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  }),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _deleted: Joi.boolean().default(false)
})

export const sellerAccountModel = {
  SELLER_ACCOUNT_COLLECTION_NAME,
  SELLER_ACCOUNT_COLLECTION_SCHEMA
}