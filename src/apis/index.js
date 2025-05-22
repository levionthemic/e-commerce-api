import { env } from '~/config/environment'
import authorizedAxiosInstance from '~/utils/authorizedAxios'

export const createGHNOrder = async (data) => {
  const url = 'https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/create'
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'ShopId': env.GHN_SHOP_ID,
      'Token': env.GHN_TOKEN_API
    }
  }
  const response = await authorizedAxiosInstance.post(url, data, config)
  return response
}