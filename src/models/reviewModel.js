import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { MAX_COMMENTS_PER_PAGE } from '~/utils/constants'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const REVIEW_COLLECTION_NAME = 'reviews'
const REVIEW_COLLECTION_SCHEMA = Joi.object({
  productId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  page: Joi.number().default(1),
  count: Joi.number().default(0),
  comments: Joi.array().items({
    buyerId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    rating: Joi.number().required(),
    content: Joi.string(),
    medias: Joi.array().items(Joi.string()),
    createdAt: Joi.date().timestamp('javascript').default(Date.now),
    updatedAt: Joi.date().timestamp('javascript').default(null),
    _deleted: Joi.boolean().default(false)
  }),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _deleted: Joi.boolean().default(false)
})

const validateBeforeAsync = async (data) => {
  return await REVIEW_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const validateReviewData = async (commentData) => {
  const schema = Joi.object({
    buyerId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    rating: Joi.number().required(),
    content: Joi.string(),
    medias: Joi.array().items(Joi.string()),
    createdAt: Joi.date().timestamp('javascript').default(Date.now),
    updatedAt: Joi.date().timestamp('javascript').default(null),
    _deleted: Joi.boolean().default(false)
  })
  return await schema.validateAsync(commentData, { abortEarly: false })
}

const findAllByProductId = async (productId) => {
  try {
    const reviewList = await GET_DB().collection(REVIEW_COLLECTION_NAME).find(
      {
        $and: [
          { productId: new ObjectId(productId) },
          { _deleted: false }
        ]
      }).toArray()
    return reviewList
  } catch (error) { throw new Error(error) }
}

const addComment = async (productId, commentData) => {
  try {
    let currentReviewDoc = await GET_DB().collection(REVIEW_COLLECTION_NAME).findOne(
      { $and: [
        { productId: new ObjectId(productId) },
        { count: { $lt: MAX_COMMENTS_PER_PAGE } },
        { _deleted: false }]
      })
    // Nếu tìm thấy doc với count < 20, thêm comment vào đó
    if (currentReviewDoc) {
      const validCommentData = await validateReviewData(commentData)
      validCommentData.buyerId = new ObjectId(validCommentData.buyerId)
      const result = await GET_DB().collection(REVIEW_COLLECTION_NAME).findOneAndUpdate(
        { _id: currentReviewDoc._id },
        {
          $push: { comments: validCommentData },
          $inc: { count: 1 }
        },
        { returnDocument: 'after' }
      )
      return result
    } else {
      // Nếu không tìm thấy doc thỏa mãn, tạo doc mới
      const lastDoc = await GET_DB().collection(REVIEW_COLLECTION_NAME).find({ productId: new ObjectId(productId) })
        .sort({ page: -1 })
        .limit(1)
        .toArray()

      const nextPage = lastDoc.length > 0 ? lastDoc[0].page + 1 : 1

      const newReviewDoc = {
        productId: productId,
        page: nextPage,
        count: 1,
        comments: [commentData]
      }

      const validNewReviewDoc = await validateBeforeAsync(newReviewDoc)

      validNewReviewDoc.productId = new ObjectId(productId)
      validNewReviewDoc.comments.buyerId = new ObjectId(commentData.buyerId)

      const insertResult = await GET_DB().collection(REVIEW_COLLECTION_NAME).insertOne(validNewReviewDoc)
      const result = await GET_DB().collection(REVIEW_COLLECTION_NAME).findOne({
        _id : new ObjectId(insertResult.insertedId)
      })
      return result
    }
  } catch (error) { throw new Error(error) }
}

export const reviewModel = {
  REVIEW_COLLECTION_NAME,
  REVIEW_COLLECTION_SCHEMA,
  addComment,
  findAllByProductId
}