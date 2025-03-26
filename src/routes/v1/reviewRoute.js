import express from 'express'
import { reviewController } from '~/controllers/reviewController'
import { reviewValidation } from '~/validations/reviewValidation'

const Router = express.Router()

Router.route('/add')
  .post(reviewValidation.addComment, reviewController.addComment)


export const reviewRoute = Router