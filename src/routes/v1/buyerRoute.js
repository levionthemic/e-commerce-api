import express from 'express'
import { buyerController } from '~/controllers/buyerController'
import { multerUploadMiddleware } from '~/middlewares/multerUploadMiddleware'
import { buyerValidation } from '~/validations/buyerValidation'

const Router = express.Router()

Router.route('/profile')
  .get(buyerController.getProfile)


Router.route('/profile/update')
  .put(multerUploadMiddleware.upload.single('avatar'), buyerValidation.updateProfile, buyerController.updateProfile)

export const buyerRoute = Router