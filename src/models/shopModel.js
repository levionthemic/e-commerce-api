import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const SHOP_COLLECTION_NAME = 'shops'
const SHOP_COLLECTION_SCHEMA = Joi.object({
  sellerId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  phone: Joi.string().required(),
  shopAddress: Joi.object({
    province: Joi.number().required(),
    district: Joi.number().required(),
    ward: Joi.string().required().trim().strict(),
    address: Joi.string().required().trim().strict()
  }),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _deleted: Joi.boolean().default(false)
})

const findOneById = async (shopId) => {
  try {
    const foundShop = await GET_DB().collection(SHOP_COLLECTION_NAME).findOne({
      _id : new ObjectId(shopId),
      _deleted: false
    })

    return foundShop
  } catch (error) {
    throw new Error(error)
  }

}

export const shopModel = {
  SHOP_COLLECTION_NAME,
  SHOP_COLLECTION_SCHEMA,
  findOneById
}