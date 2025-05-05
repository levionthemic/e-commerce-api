import express from 'express'
import { authController } from '~/controllers/authController'
import { authValidation } from '~/validations/authValidation'

const Router = express.Router()

Router.route('/login')
  .post(authValidation.login, authController.login)
Router.route('/login/google/callback')
  .post(authController.login)

Router.route('/register')
  .post(authValidation.register, authController.register)
Router.route('/register/google/callback')
  .post(authController.register)

Router.route('/verify-account')
  .put(authValidation.verifyAccount, authController.verifyAccount)

Router.route('/logout')
  .delete(authController.logout)

Router.route('/refresh-token')
  .get(authController.refreshToken)

Router.route('/forgot-password')
  .post(authValidation.forgotPassword, authController.forgotPassword)

Router.route('/otp-verify')
  .post(authController.verifyOtp)

Router.route('/reset-password')
  .put(authValidation.resetPassword, authController.resetPassword)

export const authRoute = Router