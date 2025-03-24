import { StatusCodes } from 'http-status-codes'
import { buyerModel } from '~/models/buyerModel'
import ApiError from '~/utils/ApiError'
import bcryptjs from 'bcryptjs'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'


/* eslint-disable no-useless-catch */
const getProfile = async (buyerId) => {
  try {
    const result = await buyerModel.findOneById(buyerId)

    if (!result) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Người dùng không hợp lệ')

    return result
  } catch (error) { throw error }
}

const updateProfile = async (buyerId, reqBody, buyerAvatarFile) => {
  try {
    const profile = await buyerModel.findOneById(buyerId)

    if (!profile ) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Người dùng không hợp lệ')

    if (profile.status == 'inactive') throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Người dùng đang bị khóa')

    if (reqBody.email != profile.email) throw new ApiError(StatusCodes.CONFLICT, 'Tạm thời không được thay đổi Email')

    if (reqBody.username != profile.username) throw new ApiError(StatusCodes.CONFLICT, 'Tạm thời không được thay đổi Username')

    if (reqBody.discountList != profile.discountList) throw new ApiError(StatusCodes.CONFLICT, 'Không được thay đổi danh sách Discount')

    if (reqBody.password) reqBody.password = bcryptjs.hashSync(reqBody.password, 8)

    if (buyerAvatarFile) {
      const uploadResult = await CloudinaryProvider.streamUpload(buyerAvatarFile.buffer, 'buyers')

      reqBody.avatar = uploadResult.secure_url
    }
    const result = await buyerModel.update(buyerId, reqBody)
    return result
  } catch (error) { throw error }
}

export const buyerService = {
  getProfile,
  updateProfile
}