import { StatusCodes } from 'http-status-codes'
import { sellerModel } from '~/models/sellerModel'
import ApiError from '~/utils/ApiError'
import bcryptjs from 'bcryptjs'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'
import { ACCOUNT_STATUS } from '~/utils/constants'


/* eslint-disable no-useless-catch */

const updateProfile = async (sellerId, reqBody, buyerAvatarFile) => {
  try {
    const profile = await sellerModel.findOneById(sellerId)
    const { status, email, username, discountList, password } = reqBody
    if (!profile ) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Người dùng không hợp lệ')

    if (status && profile.status === ACCOUNT_STATUS.INACTIVE) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Người dùng đang bị khóa')

    if (email && email !== profile.email) throw new ApiError(StatusCodes.CONFLICT, 'Tạm thời không được thay đổi Email')

    if (username && username !== profile.username) throw new ApiError(StatusCodes.CONFLICT, 'Tạm thời không được thay đổi Username')

    if (discountList && discountList !== profile.discountList) throw new ApiError(StatusCodes.CONFLICT, 'Không được thay đổi danh sách Discount')

    if (password) reqBody.password = bcryptjs.hashSync(password, 8)

    if (buyerAvatarFile) reqBody.avatar = await CloudinaryProvider.upload(buyerAvatarFile.buffer, 'sellers')

    const result = await sellerModel.update(sellerId, reqBody)
    return result
  } catch (error) { throw error }
}

export const sellerService = {
  updateProfile
}