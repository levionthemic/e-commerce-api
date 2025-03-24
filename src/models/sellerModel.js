import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { ACCOUNT_STATUS } from '~/utils/constants'
import { EMAIL_RULE, EMAIL_RULE_MESSAGE, OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE, PASSWORD_RULE, PASSWORD_RULE_MESSAGE } from '~/utils/validators'


const SELLER_COLLECTION_NAME = 'sellers'
const SELLER_COLLECTION_SCHEMA = Joi.object({
  username: Joi.string().required().trim().strict(),
  name: Joi.string().trim().strict(),
  email: Joi.string().required().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
  password: Joi.string().required().pattern(PASSWORD_RULE).message(PASSWORD_RULE_MESSAGE),
  coverPhoto: Joi.string(),
  score: Joi.number().default(0),
  avatar: Joi.string(),
  status: Joi.string().valid(...Object.values(ACCOUNT_STATUS)).default(ACCOUNT_STATUS.ACTIVE),
  isVerified: Joi.boolean().required().default(false),
  verifyToken: Joi.string().required().default(null),

  discountList: Joi.array().items({
    discountId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    quantity: Joi.number().default(0),
    createdAt: Joi.date().timestamp('javascript').default(Date.now),
    updatedAt: Joi.date().timestamp('javascript').default(null),
    _deleted: Joi.boolean().default(false)
  }),
  notiLog: Joi.array().items({
    title: Joi.string().trim().strict(),
    description: Joi.string(),
    type: Joi.string().trim().strict(),
    source: Joi.string().trim().strict()
  }),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _deleted: Joi.boolean().default(false)
})

const INVALID_UPDATE_FIELDS = ['_id', 'email', 'username', 'createdAt']

const validateBeforeAsync = async (data) => {
  return await SELLER_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const findOneById = async (userId) => {
  try {
    const user = await GET_DB().collection(SELLER_COLLECTION_NAME).findOne({ _id: new ObjectId(userId) })
    return user
  } catch (error) { throw new Error(error) }
}

const findOneByEmail = async (email) => {
  try {
    const user = await GET_DB().collection(SELLER_COLLECTION_NAME).findOne({ email: email })
    return user
  } catch (error) { throw new Error(error) }
}

const register = async (userData) => {
  try {
    const validUserData = await validateBeforeAsync(userData)
    const createdUser = await GET_DB().collection(SELLER_COLLECTION_NAME).insertOne(validUserData)
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

    const updatedUser = await GET_DB().collection(SELLER_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: userData },
      { returnDocument: 'after' }
    )
    return updatedUser
  } catch (error) { throw new Error(error) }
}

export const sellerModel = {
  SELLER_COLLECTION_NAME,
  SELLER_COLLECTION_SCHEMA,
  findOneById,
  findOneByEmail,
  register,
  update
}