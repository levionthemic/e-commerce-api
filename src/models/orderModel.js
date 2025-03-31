import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { EMAIL_RULE, EMAIL_RULE_MESSAGE, OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'


const ORDER_COLLECTION_NAME = 'orders'
const ORDER_COLLECTION_SCHEMA = Joi.object({
  buyerId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  sellerId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  shopId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  orgPrice: Joi.number().required(),
  discountCode: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),
  finalPrice: Joi.number().required(),
  buyerPhone: Joi.string().required(),
  buyerName: Joi.string().required(),
  buyerEmail: Joi.string().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
  status: Joi.string().default('success'),
  note: Joi.string().default(''),
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
  ).required(),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _deleted: Joi.boolean().default(false)
})

const validateBeforeAsync = async (data) => {
  return await ORDER_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}


const findOneById = async (orderId) => {
  try {
    const foundOrder = await GET_DB().collection(ORDER_COLLECTION_NAME).findOne({
      _id : new ObjectId(orderId),
      _deleted: false
    })
    return foundOrder
  } catch (error) {
    throw new Error(error)
  }
}

const addOrder = async (orderData) => {
  try {
    const validOrderData = await validateBeforeAsync(orderData)

    validOrderData.buyerId = new ObjectId(validOrderData.buyerId)
    validOrderData.sellerId = new ObjectId(validOrderData.sellerId)
    validOrderData.shopId = new ObjectId(validOrderData.shopId)

    validOrderData.itemList = validOrderData.itemList.map((item) => {
      return {
        ...item,
        productId : new ObjectId(item.productId),
        typeId : new ObjectId(item.typeId)
      }
    })

    const insertedOrder = await GET_DB().collection(ORDER_COLLECTION_NAME).insertOne(validOrderData)
    const insertedOrderId = insertedOrder.insertedId
    const foundInsertedOrder = await findOneById(insertedOrderId)
    return foundInsertedOrder
  } catch (error) {
    throw new Error(error)
  }

}

export const orderModel = {
  ORDER_COLLECTION_NAME,
  ORDER_COLLECTION_SCHEMA,
  addOrder,
  findOneById
}