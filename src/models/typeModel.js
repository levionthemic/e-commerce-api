import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const TYPE_COLLECTION_NAME = 'types'
const TYPE_COLLECTION_SCHEMA = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().default(0),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _deleted: Joi.boolean().default(false)
})

export const typeModel = {
  TYPE_COLLECTION_NAME,
  TYPE_COLLECTION_SCHEMA
}