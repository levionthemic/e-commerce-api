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


    await reviewModel.addComment(productId, commentData)


    let reviewList = await reviewModel.findAllByProductId(productId)

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


    let result = []
    for (let reviews of reviewList) {
      const comments = reviews.comments
      const res = await Promise.all(comments?.map(comment => buyerModel.findOneById(comment.buyerId)))
      reviews.comments = comments.map((comment, index) => ({ ...comment, buyerName: res[index]?.username, buyerAvatar: res[index]?.avatar }))
      result.push(reviews)
    }
    reviewList = result

    return { reviewList, updatedProduct }
  } catch (error) { throw error }
}

export const reviewService = {
  addComment
}