import { StatusCodes } from 'http-status-codes'
import { categoryService } from '~/services/categoryService'

const getListCategories = async (req, res, next) => {
  try {
    const listAllCategories = await categoryService.getListCategories()

    res.status(StatusCodes.OK).json(listAllCategories)
  } catch (error) { next(error) }
}

export const categoryController = {
  getListCategories
}