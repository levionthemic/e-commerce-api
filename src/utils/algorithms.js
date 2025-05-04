import crypto from 'crypto'

export const pagingSkipValue = (page, itemsPerPage) => {
  if (!page || !itemsPerPage) return 0
  if (page <= 0 || itemsPerPage <= 0) return 0

  return (page - 1) * itemsPerPage
}

export const generateSecureOTP = (length = 6) => {
  const otp = crypto.randomInt(0, Math.pow(10, length)).toString().padStart(length, '0')
  return otp
}
