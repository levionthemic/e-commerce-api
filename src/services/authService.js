import { StatusCodes } from 'http-status-codes'
import { authModel } from '~/models/authModel'
import ApiError from '~/utils/ApiError'
import BcryptJS from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { WEBSITE_DOMAIN } from '~/utils/constants'
import { BrevoProvider } from '~/providers/BrevoProvider'
import { pickUser } from '~/utils/formatters'

/* eslint-disable no-useless-catch */
const login = async (reqBody) => {
  try {
    //
  } catch (error) { throw error }
}

const register = async (reqBody) => {
  try {
    // Check if email existed
    const existUser = await authModel.findOneByEmail(reqBody.email)
    if (existUser) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email already existed!')
    }

    // Create user data for inserting into DB
    const newUserData = {
      email: reqBody.email,
      password: BcryptJS.hashSync(reqBody.password, 8),
      displayName: reqBody.email.split('@')[0],
      role: reqBody.role,

      isVerified: false,
      verifyToken: uuidv4()

    }
    // Insert user into DB
    const createdUser = await authModel.register(newUserData)

    // Send verification link to user's email
    const getNewUser = await authModel.findOneById(createdUser.insertedId)

    const verificationLink = `${WEBSITE_DOMAIN}/auth/verification?email=${getNewUser.email}&token=${getNewUser.verifyToken}`
    const customSubject = 'E-Commerce Website: Please verify your email before using our services!'
    const htmlContent = `
      <h3>Please click the following link to verify your account:</h3>
      <h3>${verificationLink}</h3>
      <h3>Sincerely, <br /> - Levionthemic - </h3>
    `
    await BrevoProvider.sendEmail(getNewUser.email, customSubject, htmlContent)

    // Return data for Controller
    return pickUser(getNewUser)
  } catch (error) { throw error }
}

export const authService = {
  login,
  register
}