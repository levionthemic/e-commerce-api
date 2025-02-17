import { authModel } from '~/models/authModel'

/* eslint-disable no-useless-catch */
const login = async (reqBody) => {
  try {
    //
  } catch (error) { throw error }
}

const register = async (reqBody) => {
  try {
    const createdUser = await authModel.register(reqBody)
    return createdUser
  } catch (error) { throw error }
}

export const authService = {
  login,
  register
}