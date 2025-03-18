/* eslint-disable no-useless-catch */
import { categoryModel } from '~/models/old-categoryModel'

const getListCategories = async () => {
  try {
    const listAllCategories = await categoryModel.getListCategories()
    return listAllCategories
  } catch (error) { throw error }
}

export const categoryService = {
  getListCategories
}