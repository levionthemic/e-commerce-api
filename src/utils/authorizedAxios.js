import axios from 'axios'
import { toast } from 'sonner'
import { refreshTokenAPI } from '~/apis'
import { logoutUserAPI } from '~/redux/user/userSlice'

let authorizedAxiosInstance = axios.create()
authorizedAxiosInstance.defaults.timeout = 1000 * 60 * 10
authorizedAxiosInstance.defaults.withCredentials = true

let axiosReduxStore
export const injectStore = mainStore => axiosReduxStore = mainStore

authorizedAxiosInstance.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

let refreshTokenPromise = null
authorizedAxiosInstance.interceptors.response.use(
  (response) => { return response },
  (error) => {

    if (error.response?.status === 401) {
      axiosReduxStore.dispatch(logoutUserAPI(false))
    }

    const originalRequests = error.config
    if (error?.response?.status === 410 && originalRequests) {
      if (!refreshTokenPromise) {
        refreshTokenPromise = refreshTokenAPI()
          .then((data) => {
            return data?.accessToken
          })
          .catch(_error => {
            axiosReduxStore.dispatch(logoutUserAPI(false))
            return Promise.reject(_error)
          })
          .finally(() => {
            refreshTokenPromise = null
          })
      }
      return refreshTokenPromise.then(() => {
        return authorizedAxiosInstance(originalRequests)
      })
    }

    if (error.response?.status !== 410) {
      toast.error(error.response?.data?.message || error?.message)
    }

    return Promise.reject(error)
  }
)

export default authorizedAxiosInstance