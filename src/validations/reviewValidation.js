import { StatusCodes } from 'http-status-codes'
import Joi from 'joi'
import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const addComment = async (req, res, next) => {
  const validateCondition = Joi.object({
    productId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    rating: Joi.number().required(),
    content: Joi.string().allow(''),
    medias: Joi.array().items(Joi.string())
  })

  try {
    await validateCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) { next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message)) }
}


export const reviewValidation = {
  addComment
}