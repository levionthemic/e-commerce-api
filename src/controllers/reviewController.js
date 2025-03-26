import { StatusCodes } from 'http-status-codes'
import { reviewService } from '~/services/reviewService'


const addComment = async (req, res, next) => {
  try {
    const buyerId = req.jwtDecoded._id
    const { review, updatedProduct } = await reviewService.addComment(buyerId, req.body)

    res.status(StatusCodes.OK).json({ review, updatedProduct })
  } catch (error) { next(error) }
}


export const reviewController = {
  addComment
}