import Joi from 'joi'
import { GENDER } from '~/utils/constants'
import { EMAIL_RULE, EMAIL_RULE_MESSAGE, OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE, PASSWORD_RULE, PASSWORD_RULE_MESSAGE, PHONE_RULE, PHONE_RULE_MESSAGE } from '~/utils/validators'



const BUYER_COLLECTION_NAME = 'buyers'
const BUYER_COLLECTION_SCHEMA = Joi.object({
  username: Joi.string().required().trim().strict(),
  name: Joi.string().required().trim().strict(),
  email: Joi.string().required().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
  password: Joi.string().required().pattern(PASSWORD_RULE).message(PASSWORD_RULE_MESSAGE),
  phone: Joi.string().pattern(PHONE_RULE).message(PHONE_RULE_MESSAGE),
  birthdate: Joi.date(),
  gender: Joi.string().valid(...Object.values(GENDER)),
  address: Joi.array().items({
    province: Joi.string().required().trim().strict(),
    district: Joi.string().required().trim().strict(),
    ward: Joi.string().required().trim().strict(),
    detail: Joi.string().required().trim().strict(),
  }),
  avatar: Joi.string(),
  discountList: Joi.array().items({
    discountId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    quantity: Joi.number.default(0),
    createdAt: Joi.date().timestamp('javascript').default(Date.now),
    updatedAt: Joi.date().timestamp('javascript').default(null),
    _deleted: Joi.boolean().default(false)
  }),
  searchLog: Joi.array().items({
    query: Joi.string(),
    createdAt: Joi.date().timestamp('javascript').default(Date.now),
    updatedAt: Joi.date().timestamp('javascript').default(null),
    _deleted: Joi.boolean().default(false)
  }),
  viewLog: Joi.array().items({
    productId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    createdAt: Joi.date().timestamp('javascript').default(Date.now),
    updatedAt: Joi.date().timestamp('javascript').default(null),
    _deleted: Joi.boolean().default(false)
  }),
  notiLog: Joi.array().items({
    notiId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    createdAt: Joi.date().timestamp('javascript').default(Date.now),
    updatedAt: Joi.date().timestamp('javascript').default(null),
    _deleted: Joi.boolean().default(false)
  }),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _deleted: Joi.boolean().default(false)
})

export const buyerModel = {
  BUYER_COLLECTION_NAME,
  BUYER_COLLECTION_SCHEMA
}