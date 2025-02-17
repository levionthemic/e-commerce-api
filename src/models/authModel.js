/* eslint-disable no-useless-catch */
import Joi from 'joi'
import { GET_DB } from '~/config/mongodb'

const USER_COLLECTION_NAME = 'users'
const USER_COLLECTION_SCHEMA = Joi.object({
  fullname: Joi.string(),
  dateOfBirth: Joi.date(),
  sex: Joi.string(),
  phoneNumber: Joi.string(),
  email: Joi.string(),
  password: Joi.string(),
  avatar: Joi.string(),

  isVerified: Joi.boolean.default(false),
  verifyToken: Joi.string().default(null),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _deleted: Joi.boolean().default(false)
})

const validateBeforeAsync = async (data) => {
  return await USER_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const register = async (userData) => {
  try {
    const validUserData = await validateBeforeAsync(userData)
    const createdUser = await GET_DB().collection(USER_COLLECTION_NAME).insertOne(validUserData)
    return createdUser
  } catch (error) { throw new Error(error) }
}

export const authModel = {
  USER_COLLECTION_NAME,
  USER_COLLECTION_SCHEMA,
  register
}