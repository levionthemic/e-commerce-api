import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const VIEW_LOG_COLLECTION_NAME = 'viewLogs'
const VIEW_LOG_COLLECTION_SCHEMA = Joi.object({
  buyerId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  productId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  quantity: Joi.number(),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _deleted: Joi.boolean().default(false)
})

export const viewLogModel = {
  VIEW_LOG_COLLECTION_NAME,
  VIEW_LOG_COLLECTION_SCHEMA
}