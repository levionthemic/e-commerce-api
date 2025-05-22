import Joi from 'joi'

const GHN_ORDER_SCHEMA = Joi.object({
  from_name: Joi.string().required(),
  from_phone: Joi.string().required(),
  from_address: Joi.string().required(),
  from_ward_name: Joi.string().required(),
  from_district_name: Joi.string().required(),
  from_province_name: Joi.string().required(),
  to_name: Joi.string().required(),
  to_phone: Joi.string().required(),
  to_address: Joi.string().required(),
  to_ward_name: Joi.string().required(),
  to_district_name: Joi.string().required(),
  to_province_name: Joi.string().required(),
  return_phone: Joi.string(),
  return_address: Joi.string(),
  return_district_name: Joi.string(),
  return_ward_name: Joi.string(),
  return_province_name: Joi.string(),
  client_order_code: Joi.string().default(null),
  cod_amount: Joi.number().max(50000000).default(0),
  content: Joi.string().allow('').default(''),
  weight: Joi.number().max(50000),
  length: Joi.number().max(200),
  width: Joi.number().max(200),
  height: Joi.number().max(200),
  pick_station_id: Joi.number(),
  insurance_value: Joi.number().max(5000000).default(0),
  coupon: Joi.string().allow(''),
  service_type_id: Joi.number().required(),
  payment_type_id: Joi.number().required(),
  note: Joi.string().allow(''),
  required_note: Joi.string().required(),
  pickup_time: Joi.number(),
  Items: Joi.array().items({
    name: Joi.string().required(),
    code: Joi.string(),
    quantity: Joi.number().required(),
    price: Joi.number().required(),
    length: Joi.number().required(),
    weight: Joi.number().required(),
    width: Joi.number().required(),
    height: Joi.number().required()
  }),
  cod_failed_amount: Joi.number()
})

export const GHNProvider = { GHN_ORDER_SCHEMA }
