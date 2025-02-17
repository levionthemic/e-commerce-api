import { StatusCodes } from 'http-status-codes'
import { authService } from '~/services/authService'

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body)


    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const register = async (req, res, next) => {
  try {
    const createdUser = await authService.register(req.body)
    return res.status(StatusCodes.CREATED).json(createdUser)
  } catch (error) { next(error) }
}

export const authController = {
  login,
  register
}