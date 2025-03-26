import { StatusCodes } from 'http-status-codes'
import Joi from 'joi'
import ApiError from '~/utils/ApiError'

const addOrder = async (req, res, next) => {
  const validateCondition = Joi.object({

  })

  try {
    await validateCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) { next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message)) }
}

export const orderValidation = {
  addOrder
}