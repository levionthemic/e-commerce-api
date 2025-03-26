import { StatusCodes } from 'http-status-codes'
import { sellerService } from '~/services/sellerService'


const updateProfile = async (req, res, next) => {
  try {
    const sellerId = req.jwtDecoded._id
    const updatedProfile = await sellerService.updateProfile(sellerId, req.body, req.file)

    res.status(StatusCodes.CREATED).json(updatedProfile)
  } catch (error) { next(error) }
}


export const sellerController = {
  updateProfile
}