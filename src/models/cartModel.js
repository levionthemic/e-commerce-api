import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { GET_DB } from '~/config/mongodb'

const CART_COLLECTION_NAME = 'carts'
const CART_COLLECTION_SCHEMA = Joi.object({
  buyerId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  itemList: Joi.array().items(
    {
      productId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
      typeId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
      quantity: Joi.number().required()
    }
  ),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _deleted: Joi.boolean().default(false)
})

const createNew = async (buyerId) => {
  try {
    const validData = await CART_COLLECTION_SCHEMA.validateAsync({ buyerId: buyerId })
    const insertData = {
      ...validData,
      buyerId: new ObjectId(validData.buyerId),
      itemList: []
    }
    return await GET_DB().collection(CART_COLLECTION_NAME).insertOne(insertData)
  } catch (error) { throw new Error(error) }
}

const getCart = async (buyerId) => {
  try {
    const result = await GET_DB().collection(CART_COLLECTION_NAME).findOne({ buyerId: new ObjectId(buyerId) })
    return result
  } catch (error) { throw new Error(error) }
}

const findOneByBuyerId = async (buyerId) => {
  try {
    const result = await GET_DB().collection(CART_COLLECTION_NAME).findOne({ buyerId: new ObjectId(buyerId) })
    return result
  } catch (error) { throw new Error(error) }
}


const updateItemLists = async (buyerId, itemList) => {
  try {
    const result = await GET_DB().collection(CART_COLLECTION_NAME).findOneAndUpdate(
      { buyerId: new ObjectId(buyerId) },
      { $set: { itemList: itemList } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw new Error(error) }
}

const updateQuantity = async (buyerId, reqBody) => {
  try {
    const result = await GET_DB().collection(CART_COLLECTION_NAME).findOneAndUpdate(
      { $and: [
        { buyerId: new ObjectId(buyerId) },
        { 'itemList.productId': new ObjectId(reqBody.productId) },
        { 'itemList.typeId': new ObjectId(reqBody.typeId) }
      ] },
      { $set: { 'itemList.$.quantity': reqBody.quantity } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw new Error(error) }
}

const deleteItem = async (buyerId, reqBody) => {
  try {
    const result = await GET_DB().collection(CART_COLLECTION_NAME).findOneAndUpdate(
      { buyerId: new ObjectId(buyerId) },
      {
        $pull: {
          itemList: {
            productId: new ObjectId(reqBody.productId),
            typeId: new ObjectId(reqBody.typeId)
          }
        }
      },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw new Error(error) }
}

export const cartModel = {
  CART_COLLECTION_NAME,
  CART_COLLECTION_SCHEMA,
  getCart,
  findOneByBuyerId,
  updateItemLists,
  createNew,
  updateQuantity,
  deleteItem
}
