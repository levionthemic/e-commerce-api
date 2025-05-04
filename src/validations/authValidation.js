import { StatusCodes } from 'http-status-codes'
import Joi from 'joi'
import ApiError from '~/utils/ApiError'
import { ACCOUNT_ROLE } from '~/utils/constants'
import { EMAIL_RULE, EMAIL_RULE_MESSAGE, PASSWORD_RULE, PASSWORD_RULE_MESSAGE } from '~/utils/validators'

const USER_ROLES = {
  ADMIN: 'admin',
  BUYER: 'buyer',
  SELLER: 'seller'
}

const login = async (req, res, next) => {
  const correctCondition = Joi.object({
    email: Joi.string().required().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
    password: Joi.string().required().pattern(PASSWORD_RULE).message(PASSWORD_RULE_MESSAGE),
    role: Joi.string().required().valid(...Object.values(USER_ROLES))
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) { next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message)) }
}

const register = async (req, res, next) => {
  const correctCondition = Joi.object({
    email: Joi.string().required().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
    password: Joi.string().required().pattern(PASSWORD_RULE).message(PASSWORD_RULE_MESSAGE),
    role: Joi.string().required()
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) { next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message)) }
}

const verifyAccount = async (req, res, next) => {
  const correctCondition = Joi.object({
    email: Joi.string().required().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
    token: Joi.string().required(),
    role: Joi.string().required().valid(...Object.values(ACCOUNT_ROLE))
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) { next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message)) }
}

const forgotPassword = async (req, res, next) => {
  const correctCondition = Joi.object({
    email: Joi.string().required().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE)
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) { next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message)) }
}

export const authValidation = {
  login,
  register,
  verifyAccount,
  forgotPassword
}