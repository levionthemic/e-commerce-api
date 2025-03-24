import { StatusCodes } from 'http-status-codes'
import { buyerModel } from '~/models/buyerModel'
import ApiError from '~/utils/ApiError'
import bcryptjs from 'bcryptjs'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'
import { ACCOUNT_STATUS } from '~/utils/constants'


/* eslint-disable no-useless-catch */
const getProfile = async (buyerId) => {
  try {
    const result = await buyerModel.findOneById(buyerId)
    delete result['password']
    if (!result) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Người dùng không hợp lệ')

    return result
  } catch (error) { throw error }
}

const updateProfile = async (buyerId, reqBody, buyerAvatarFile) => {
  try {
    const profile = await buyerModel.findOneById(buyerId)
    const { status, email, username, discountList, password } = reqBody
    if (!profile ) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Người dùng không hợp lệ')

    if (status && profile.status === ACCOUNT_STATUS.INACTIVE) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Người dùng đang bị khóa')

    if (email && email !== profile.email) throw new ApiError(StatusCodes.CONFLICT, 'Tạm thời không được thay đổi Email')

    if (username && username !== profile.username) throw new ApiError(StatusCodes.CONFLICT, 'Tạm thời không được thay đổi Username')

    if (discountList && discountList !== profile.discountList) throw new ApiError(StatusCodes.CONFLICT, 'Không được thay đổi danh sách Discount')

    if (password) reqBody.password = bcryptjs.hashSync(password, 8)

    if (buyerAvatarFile) reqBody.avatar = await CloudinaryProvider.upload(buyerAvatarFile.buffer, 'buyers')

    const result = await buyerModel.update(buyerId, reqBody)
    return result
  } catch (error) { throw error }
}

export const buyerService = {
  getProfile,
  updateProfile
}