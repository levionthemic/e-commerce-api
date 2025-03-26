import { StatusCodes } from 'http-status-codes'
import Joi from 'joi'
import ApiError from '~/utils/ApiError'
import { ACCOUNT_STATUS } from '~/utils/constants'
import { PHONE_RULE, PHONE_RULE_MESSAGE } from '~/utils/validators'


const updateProfile = async (req, res, next) => {
  const validateCondition = Joi.object({
    name: Joi.string().trim().strict(),
    phone: Joi.string().pattern(PHONE_RULE).message(PHONE_RULE_MESSAGE),
    address: Joi.string(),
    avatar: Joi.string(),
    coverPhoto: Joi.string(),
    status: Joi.string().required().valid(...Object.values(ACCOUNT_STATUS)),
    foundedDate: Joi.date(),
    description: Joi.string(),
    socialNetworks: Joi.array().items(Joi.string().allow(''))
  })

  try {
    await validateCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) { next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message)) }
}

export const sellerValidation = {
  updateProfile
}