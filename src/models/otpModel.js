/* eslint-disable no-useless-catch */
import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'

const OTP_COLLECTION_NAME = 'otps'
const OTP_COLLECTION_SCHEMA = Joi.object({
  identifier: Joi.string().required(),
  code: Joi.string().required(),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  expiresAt: Joi.date().required().timestamp('javascript').default(null)
})

const validateBeforeAsync = async (data) => {
  return await OTP_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const create = async (data) => {
  try {
    const validData = await validateBeforeAsync(data)

    await GET_DB()
      .collection(OTP_COLLECTION_NAME)
      .deleteMany({ identifier: data.identifier })
    await GET_DB().collection(OTP_COLLECTION_NAME).insertOne(validData)
  } catch (error) {
    throw new Error(error)
  }
}

const findOneByIdentifier = async (identifier) => {
  try {
    const result = await GET_DB().collection(OTP_COLLECTION_NAME).findOne({ identifier: identifier })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const deleteOtpById = async (id) => {
  try {
    const result = await GET_DB().collection(OTP_COLLECTION_NAME).deleteOne({ _id: new ObjectId(id) })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

export const otpModel = {
  OTP_COLLECTION_NAME,
  OTP_COLLECTION_SCHEMA,
  create,
  findOneByIdentifier,
  deleteOtpById
}
