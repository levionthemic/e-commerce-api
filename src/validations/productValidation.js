import { StatusCodes } from 'http-status-codes'
import Joi from 'joi'
import { productModel } from '~/models/productModel'
import ApiError from '~/utils/ApiError'
import { slugify } from '~/utils/formatters'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const createProduct = async (req, res, next) => {
  const validateCondition = Joi.object({
    name: Joi.string().required().trim().strict(),
    slug: Joi.string().required().trim().strict(),
    price: Joi.number().required().min(0),
    discountPercentage: Joi.number().min(0).max(100),
    rate: Joi.number().required().min(0).max(5),
    thumbnailUrl: Joi.string().required(),
    description: Joi.string().min(0),
    quantityInStock: Joi.number().required().min(0),
    quantitySold: Joi.number().default(0).min(0),
    categoryId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  })

  try {
    await validateCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) { next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message)) }
}
export const productValidation = {
  createProduct
}