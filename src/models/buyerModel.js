import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { ACCOUNT_ROLE, ACCOUNT_STATUS, GENDER } from '~/utils/constants'
import { pickUser } from '~/utils/formatters'
import { EMAIL_RULE, EMAIL_RULE_MESSAGE, OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE, PASSWORD_RULE, PASSWORD_RULE_MESSAGE, PHONE_RULE, PHONE_RULE_MESSAGE } from '~/utils/validators'

const BUYER_COLLECTION_NAME = 'buyers'
const BUYER_COLLECTION_SCHEMA = Joi.object({
  username: Joi.string().required().trim().strict(),
  name: Joi.string().trim().strict(),
  email: Joi.string().required().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
  password: Joi.string().required().pattern(PASSWORD_RULE).message(PASSWORD_RULE_MESSAGE),
  phone: Joi.string().pattern(PHONE_RULE).message(PHONE_RULE_MESSAGE),
  birthdate: Joi.date(),
  gender: Joi.string().valid(...Object.values(GENDER)),
  status: Joi.string().valid(...Object.values(ACCOUNT_STATUS)).default(ACCOUNT_STATUS.ACTIVE),
  address: Joi.array().items({
    province: Joi.number().required(),
    district: Joi.number().required(),
    ward: Joi.string().required().trim().strict(),
    detail: Joi.string().required().trim().strict()
  }),
  avatar: Joi.string(),

  isVerified: Joi.boolean().required().default(false),
  verifyToken: Joi.string().required().default(null),

  discountList: Joi.array().items({
    discountId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    quantity: Joi.number().default(0)
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

const INVALID_UPDATE_FIELDS = ['_id', 'email', 'username', 'createdAt', 'discountList', 'notiLogs']

const validateBeforeAsync = async (data) => {
  return await BUYER_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const findOneById = async (userId) => {
  try {
    const user = await GET_DB().collection(BUYER_COLLECTION_NAME).findOne({ _id: new ObjectId(userId) })
    return user
  } catch (error) { throw new Error(error) }
}

const findOneByEmail = async (email) => {
  try {
    const user = await GET_DB().collection(BUYER_COLLECTION_NAME).findOne({ email: email })
    return user
  } catch (error) { throw new Error(error) }
}

const register = async (userData) => {
  try {
    const validUserData = await validateBeforeAsync(userData)
    const createdUser = await GET_DB().collection(BUYER_COLLECTION_NAME).insertOne(validUserData)
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

    const updatedUser = await GET_DB().collection(BUYER_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: userData },
      { returnDocument: 'after' }
    )
    return { ...pickUser(updatedUser), role: ACCOUNT_ROLE.BUYER }
  } catch (error) { throw new Error(error) }
}


export const buyerModel = {
  BUYER_COLLECTION_NAME,
  BUYER_COLLECTION_SCHEMA,
  findOneById,
  findOneByEmail,
  register,
  update
}