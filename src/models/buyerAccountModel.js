import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'



const BUYER_ACCOUNT_COLLECTION_NAME = 'buyerAccounts'
const BUYER_ACCOUNT_COLLECTION_SCHEMA = Joi.object({
  page: Joi.number().default(1),
  count: Joi.number().default(0),
  accountList: Joi.array().items({
    buyerId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  }),
  
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _deleted: Joi.boolean().default(false)
})

export const buyerAccountModel = {
  BUYER_ACCOUNT_COLLECTION_NAME,
  BUYER_ACCOUNT_COLLECTION_SCHEMA
}