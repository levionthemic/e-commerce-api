import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'


const BRAND_COLLECTION_NAME = 'brands'
const BRAND_COLLECTION_SCHEMA = Joi.object({
  name: Joi.string().required().trim().strict(),
  description: Joi.string(),
  avatar: Joi.string(),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _deleted: Joi.boolean().default(false)
})

const findOneById = async (brandId) => {
  try {
    const brand = await GET_DB().collection(BRAND_COLLECTION_NAME).findOne({ _id: new ObjectId(brandId) })
    return brand
  } catch (error) { throw new Error(error) }
}

export const brandModel = {
  BRAND_COLLECTION_NAME,
  BRAND_COLLECTION_SCHEMA,
  findOneById
}