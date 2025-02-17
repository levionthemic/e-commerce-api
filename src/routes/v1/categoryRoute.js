import express from 'express'
import { categoryController } from '~/controllers/categoryController'
import { categoryValidation } from '~/validations/categoryValidation'

const Router = express.Router()

Router.route('/')
  .get(categoryController.getListCategories)
  // .post(categoryValidation.addCategory, categoryController.addCategory)

// Router.route('/:id')
//   .get(categoryController.getCategoryDetails)
//   .put(categoryValidation.updateCategory, categoryController.updateCategory)
//   .delete(categoryController.deleteCategory)

// Router.route('/parent/:id')
//   .get(categoryController.getParentCategoryById)

export const categoryRoute = Router