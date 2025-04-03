import { StatusCodes } from 'http-status-codes'
import { buyerModel } from '~/models/buyerModel'
import { productModel } from '~/models/productModel'
import { reviewModel } from '~/models/reviewModel'
import ApiError from '~/utils/ApiError'

/* eslint-disable no-useless-catch */
const addComment = async (buyerId, reqBody) => {
  try {
    const productId = reqBody.productId
    const existProduct = await productModel.findOneById(productId)

    if (!existProduct) throw new ApiError(StatusCodes.NOT_FOUND, 'Review: Product is not available')

    delete reqBody['productId']
    const commentData = { ...reqBody, buyerId }


    const review = await reviewModel.addComment(productId, commentData)
    for (let comment of review.comments) {
      const buyer = await buyerModel.findOneById(review.comments[0].buyerId.toString())
      comment.buyerName = buyer.username
    }


    const reviewList = await reviewModel.findAllByProductId(productId)

    let totalRating = 0
    let totalComments = 0
    reviewList.forEach((review) => {
      totalComments += review.count
      review.comments.forEach((comment) => {
        totalRating += comment.rating
      })
    })

    const newRating = (totalRating)/(totalComments)
    const productData = {
      rating: parseFloat(newRating.toFixed(1))
    }

    const updatedProduct = await productModel.update(productId, productData)

    return { review, updatedProduct }
  } catch (error) { throw error }
}

export const reviewService = {
  addComment
}