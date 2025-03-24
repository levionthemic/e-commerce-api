import { StatusCodes } from 'http-status-codes'
import { buyerService } from '~/services/buyerService'


const getProfile = async (req, res, next) => {
  try {
    const buyerId = req.jwtDecoded._id
    const profile = await buyerService.getProfile(buyerId)

    res.status(StatusCodes.OK).json(profile)
  } catch (error) { next(error) }
}

const updateProfile = async (req, res, next) => {
  try {
    const buyerId = req.jwtDecoded._id
    const updatedProfile = await buyerService.updateProfile(buyerId, req.body, req.file)

    res.status(StatusCodes.CREATED).json(updatedProfile)
  } catch (error) { next(error) }
}


export const buyerController = {
  getProfile,
  updateProfile
}