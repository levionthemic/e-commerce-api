/* eslint-disable no-useless-catch */
import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const SESSION_COLLECTION_NAME = 'sessions'
const SESSION_COLLECTION_SCHEMA = Joi.object({
  sessionId: Joi.string().uuid().required(),
  userId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  refreshToken: Joi.string().required(),
  userAgent: Joi.string(),
  ipAddress: Joi.string(),
  isRevoked: Joi.boolean().default(false),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  expiresAt: Joi.date().timestamp('javascript').default(null)
})

const validateBeforeAsync = async (data) => {
  return await SESSION_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const create = async (data) => {
  try {
    const validData = await validateBeforeAsync(data)
    validData.userId = new ObjectId(validData.userId)

    await GET_DB().collection(SESSION_COLLECTION_NAME).insertOne(validData)
  } catch (error) { throw new Error(error) }

}

const findOneBySessionId = async (sessionId) => {
  try {
    const result = await GET_DB().collection(SESSION_COLLECTION_NAME).findOne({ sessionId: sessionId })
    return result
  } catch (error) { throw new Error(error) }
}

const revokeSession = async (sessionId) => {
  try {
    await GET_DB().collection(SESSION_COLLECTION_NAME).updateOne(
      { sessionId },
      { $set: { isRevoked: true } }
    )
  } catch (error) { throw new Error(error) }
}

export const sessionModel = {
  SESSION_COLLECTION_NAME,
  SESSION_COLLECTION_SCHEMA,
  create,
  findOneBySessionId,
  revokeSession
}