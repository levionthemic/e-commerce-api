import { CANCELLED } from 'dns'
import { env } from '~/config/environment'

export const WHITELIST_DOMAINS = [
  'http://localhost:5173',
  'https://e-commerce-web-liart-alpha.vercel.app'
]

export const WEBSITE_DOMAIN = (env.BUILD_MODE === 'dev') ? env.WEBSITE_DOMAIN_DEVELOPMENT : env.WEBSITE_DOMAIN_PRODUCTION

export const DEFAULT_ITEMS_PER_PAGE = 40

export const MAX_COMMENTS_PER_PAGE = 4


export const GENDER = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other'
}

export const ACCOUNT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
}

export const ACCOUNT_ROLE = {
  BUYER: 'buyer',
  SELLER: 'seller',
  ADMIN: 'admin'
}

export const ORDER_STATUS = {
  PENDING: 'pending',
  SHIPPING: 'shipping',
  SUCCESS: 'success',
  FAIL: 'fail',
  CANCELLED: 'cancelled'
}