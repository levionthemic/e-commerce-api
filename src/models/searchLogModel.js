import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const SEARCH_LOG_COLLECTION_NAME = 'searchLogs'
const SEARCH_LOG_COLLECTION_SCHEMA = Joi.object({
  buyerId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  query: Joi.string(),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _deleted: Joi.boolean().default(false)
})

export const searchLogModel = {
  SEARCH_LOG_COLLECTION_NAME,
  SEARCH_LOG_COLLECTION_SCHEMA
}