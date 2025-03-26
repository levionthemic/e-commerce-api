import express from 'express'
import { sellerController } from '~/controllers/sellerController'
import { multerUploadMiddleware } from '~/middlewares/multerUploadMiddleware'
import { sellerValidation } from '~/validations/sellerValidation'

const Router = express.Router()

Router.route('/profile/update')
  .put(multerUploadMiddleware.upload.single('avatar'), sellerValidation.updateProfile, sellerController.updateProfile)

export const sellerRoute = Router