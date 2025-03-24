import { env } from '~/config/environment'

export const WHITELIST_DOMAINS = [
  'http://localhost:5173'
]

export const WEBSITE_DOMAIN = (env.BUILD_MODE === 'dev') ? env.WEBSITE_DOMAIN_DEVELOPMENT : env.WEBSITE_DOMAIN_PRODUCTION

export const DEFAULT_ITEMS_PER_PAGE = 40

export const GENDER = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other'
}

export const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
}

export const ACCOUNT_ROLE = {
  BUYER: 'buyer',
  SELLER: 'seller',
  ADMIN: 'admin'
}