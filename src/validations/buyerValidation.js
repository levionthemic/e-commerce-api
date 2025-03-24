import { StatusCodes } from 'http-status-codes'
import Joi from 'joi'
import ApiError from '~/utils/ApiError'
import { ACCOUNT_STATUS, GENDER } from '~/utils/constants'
import { PHONE_RULE, PHONE_RULE_MESSAGE } from '~/utils/validators'


const updateProfile = async (req, res, next) => {
  const validateCondition = Joi.object({
    name: Joi.string().trim().strict(),
    phone: Joi.string().pattern(PHONE_RULE).message(PHONE_RULE_MESSAGE),
    birthdate: Joi.date(),
    gender: Joi.string().required().valid(...Object.values(GENDER)),
    address: Joi.array().items({
      province: Joi.string().required().trim().strict(),
      district: Joi.string().required().trim().strict(),
      ward: Joi.string().required().trim().strict(),
      detail: Joi.string().required().trim().strict()
    }),
    avatar: Joi.string(),
    status: Joi.string().required().valid(...Object.values(ACCOUNT_STATUS))
  })

  try {
    await validateCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) { next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message)) }
}

export const buyerValidation = {
  updateProfile
}