import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const NOTI_LOG_COLLECTION_NAME = 'notiLogs'
const NOTI_LOG_COLLECTION_SCHEMA = Joi.object({
  userId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  name: Joi.string().trim().strict(),
  description: Joi.string(),
  type: Joi.string(),
  source: Joi.string(),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _deleted: Joi.boolean().default(false)
})

export const notiLogModel = {
  NOTI_LOG_COLLECTION_NAME,
  NOTI_LOG_COLLECTION_SCHEMA
}