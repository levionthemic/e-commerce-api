import { StatusCodes } from 'http-status-codes'
import Joi from 'joi'
import ApiError from '~/utils/ApiError'
import { EMAIL_RULE, EMAIL_RULE_MESSAGE, OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const clusterOrder = async (req, res, next) => {
  const validateCondition = Joi.object({
    buyerPhone: Joi.string().required(),
    buyerName: Joi.string().required(),
    email: Joi.string().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
    buyerAddress: Joi.object({
      address: Joi.string().required().trim().strict(),
      ward: Joi.string().required().trim().strict(),
      district: Joi.number().required(),
      province: Joi.number().required()
    }).required(),
    itemList: Joi.array().items(
      {
        productId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
        typeId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
        quantity: Joi.number().required()
      }
    )
  })

  try {
    await validateCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) { next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message)) }
}

const addOrder = async (req, res, next) => {
  const validateCondition = Joi.object({
    sellerId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    shopId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    orgPrice: Joi.number().required(),
    discountCode: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),
    finalPrice: Joi.number().required(),
    buyerPhone: Joi.string().required(),
    buyerName: Joi.string().required(),
    buyerEmail: Joi.string().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
    note: Joi.string(),
    buyerAddress: Joi.object({
      province: Joi.number().required(),
      district: Joi.number().required(),
      ward: Joi.string().required().trim().strict(),
      address: Joi.string().required().trim().strict()
    }).required(),
    shippingFee: Joi.number().required().default(0),
    shippingMethod: Joi.string().required(),
    itemList: Joi.array().items(
      {
        productId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
        typeId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
        productName: Joi.string().required().trim().strict(),
        typeName: Joi.string().required().trim().strict(),
        price: Joi.number().required(),
        avatar: Joi.string(),
        quantity: Joi.number().required()
      }
    )
  })

  try {
    await validateCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) { next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message)) }
}

export const orderValidation = {
  addOrder,
  clusterOrder
}