import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { ACCOUNT_ROLE } from '~/utils/constants'
import { pickUser } from '~/utils/formatters'
import {
  EMAIL_RULE,
  EMAIL_RULE_MESSAGE,
  PHONE_RULE,
  PHONE_RULE_MESSAGE
} from '~/utils/validators'

const ADMIN_COLLECTION_NAME = 'admins'
const ADMIN_COLLECTION_SCHEMA = Joi.object({
  username: Joi.string().required().trim().strict(),
  name: Joi.string().trim().strict(),
  email: Joi.string()
    .required()
    .pattern(EMAIL_RULE)
    .message(EMAIL_RULE_MESSAGE),
  password: Joi.string().required(),
  phone: Joi.string().pattern(PHONE_RULE).message(PHONE_RULE_MESSAGE),

  avatar: Joi.string(),

  isVerified: Joi.boolean().required().default(false),
  verifyToken: Joi.string().required().default(null).allow(null),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _deleted: Joi.boolean().default(false)
})

const INVALID_UPDATE_FIELDS = [
  '_id',
  'email',
  'username',
  'createdAt'
]

const validateBeforeAsync = async (data) => {
  return await ADMIN_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false
  })
}

const findOneById = async (userId) => {
  try {
    const user = await GET_DB()
      .collection(ADMIN_COLLECTION_NAME)
      .findOne({ _id: new ObjectId(userId) })
    return user
  } catch (error) {
    throw new Error(error)
  }
}

const findOneByEmail = async (email) => {
  try {
    const user = await GET_DB()
      .collection(ADMIN_COLLECTION_NAME)
      .findOne({ email: email })
    return user
  } catch (error) {
    throw new Error(error)
  }
}

const register = async (userData) => {
  try {
    const validUserData = await validateBeforeAsync(userData)
    const createdUser = await GET_DB()
      .collection(ADMIN_COLLECTION_NAME)
      .insertOne(validUserData)
    return createdUser
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (userId, userData) => {
  try {
    Object.keys(userData).forEach((fieldName) => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete userData[fieldName]
      }
    })

    const updatedUser = await GET_DB()
      .collection(ADMIN_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(userId) },
        { $set: userData },
        { returnDocument: 'after' }
      )
    return { ...pickUser(updatedUser), role: ACCOUNT_ROLE.BUYER }
  } catch (error) {
    throw new Error(error)
  }
}

export const adminModel = {
  ADMIN_COLLECTION_NAME,
  ADMIN_COLLECTION_SCHEMA,
  findOneById,
  findOneByEmail,
  register,
  update
}
