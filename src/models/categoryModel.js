import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'



const CATEGORY_COLLECTION_NAME = 'categories'
const CATEGORY_COLLECTION_SCHEMA = Joi.object({
  name: Joi.string().required().trim().strict(),
  description: Joi.string(),
  avatar: Joi.string(),
  parentCategoryId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).default(null),
  childrenCategoryId: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).optional(),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _deleted: Joi.boolean().default(false)
})

const getListCategories = async () => {
  try {
    const categoryList = await GET_DB().collection(CATEGORY_COLLECTION_NAME).find({ _deleted: false }).toArray()
    return categoryList
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (categoryId) => {
  try {
    const category = await GET_DB().collection(CATEGORY_COLLECTION_NAME).findOne({ _id: new ObjectId(categoryId) })
    return category
  } catch (error) { throw new Error(error) }
}

export const categoryModel = {
  CATEGORY_COLLECTION_NAME,
  CATEGORY_COLLECTION_SCHEMA,
  getListCategories,
  findOneById
}