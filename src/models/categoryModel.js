const Joi = require('joi')
const { GET_DB } = require('~/config/mongodb')

const CATEGORY_COLLECTION_NAME = 'categories'
const CATEGORY_COLLECTION_SCHEMA = Joi.object({
  categoryId: Joi.number().required(),
  iconUrl: Joi.string().required(),
  name: Joi.string().trim().strict(),
  sellerId: Joi.string().default(null)
})

const getListCategories = async () => {
  try {
    const listAllCategories = await GET_DB().collection(CATEGORY_COLLECTION_NAME).find({}).limit(12).toArray()
    return listAllCategories
  } catch (error) { throw new Error(error) }
}

export const categoryModel = {
  CATEGORY_COLLECTION_NAME,
  CATEGORY_COLLECTION_SCHEMA,
  getListCategories
}