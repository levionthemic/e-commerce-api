import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const SHOP_TYPE_PRODUCT_COLLECTION_NAME = 'shop_type_product'
const SHOP_TYPE_PRODUCT_COLLECTION_SCHEMA = Joi.object({
  productId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  shopId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  typeId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).default(null),
  stock: Joi.number().default(0),
})

export const shopTypeProductModel = {
  SHOP_TYPE_PRODUCT_COLLECTION_NAME,
  SHOP_TYPE_PRODUCT_COLLECTION_SCHEMA
}