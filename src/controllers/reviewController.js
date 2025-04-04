import { StatusCodes } from 'http-status-codes'
import { reviewService } from '~/services/reviewService'


const addComment = async (req, res, next) => {
  try {
    const buyerId = req.jwtDecoded._id
    const { reviewList, updatedProduct } = await reviewService.addComment(buyerId, req.body)

    req.io.to(updatedProduct._id.toString()).emit('BE_NEW_REVIEW', { reviewList, updatedProduct })

    res.status(StatusCodes.OK).json({ reviewList, updatedProduct })
  } catch (error) { next(error) }
}


export const reviewController = {
  addComment
}