/* eslint-disable no-useless-catch */
import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { EMAIL_RULE, EMAIL_RULE_MESSAGE } from '~/utils/validators'

const USER_ROLES = {
  ADMIN: 'admin',
  BUYER: 'buyer',
  SELLER: 'seller'
}

const USER_GENDERS = {
  MALE: 'male',
  FEMALE: 'female'
}

const USER_COLLECTION_NAME = 'users'
const USER_COLLECTION_SCHEMA = Joi.object({
  fullName: Joi.string().trim().strict(),
  displayName: Joi.string().trim().strict(),
  dateOfBirth: Joi.date(),
  gender: Joi.string().valid(...Object.values(USER_GENDERS)),
  phoneNumber: Joi.string(),
  avatar: Joi.string(),
  address: Joi.string(),

  role: Joi.string().required().valid(...Object.values(USER_ROLES)).default(USER_ROLES.BUYER),
  email: Joi.string().required().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
  password: Joi.string().required(),

  isVerified: Joi.boolean().required().default(false),
  verifyToken: Joi.string().required().default(null),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _deleted: Joi.boolean().default(false)
})

const INVALID_UPDATE_FIELDS = ['_id', 'email', 'username', 'createdAt']

const validateBeforeAsync = async (data) => {
  return await USER_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const findOneById = async (userId) => {
  try {
    const user = await GET_DB().collection(USER_COLLECTION_NAME).findOne({ _id: new ObjectId(userId) })
    return user
  } catch (error) { throw new Error(error) }
}

const findOneByEmail = async (email) => {
  try {
    const user = await GET_DB().collection(USER_COLLECTION_NAME).findOne({ email: email })
    return user
  } catch (error) { throw new Error(error) }
}

const register = async (userData) => {
  try {
    const validUserData = await validateBeforeAsync(userData)
    const createdUser = await GET_DB().collection(USER_COLLECTION_NAME).insertOne(validUserData)
    return createdUser
  } catch (error) { throw new Error(error) }
}

const update = async (userId, userData) => {
  try {
    Object.keys(userData).forEach(fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete userData[fieldName]
      }
    })

    const updatedUser = await GET_DB().collection(USER_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: userData },
      { returnDocument: 'after' }
    )
    return updatedUser
  } catch (error) { throw new Error(error) }
}

export const authModel = {
  USER_COLLECTION_NAME,
  USER_COLLECTION_SCHEMA,
  USER_ROLES,
  USER_GENDERS,
  register,
  findOneById,
  findOneByEmail,
  update
}