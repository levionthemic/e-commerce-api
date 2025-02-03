module.exports.generateTokenString = (length) => {
  const letters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890'
  let token = ''
  for (let i = 0; i < length; i++) {
    const pos = parseInt(Math.floor(Math.random() * 61))
    token += letters.charAt(pos)
  }
  return token
}

module.exports.generateOTP = (length) => {
  const letters = '1234567890'
  let otp = ''
  for (let i = 0; i < length; i++) {
    const pos = parseInt(Math.floor(Math.random() * 9))
    otp += letters.charAt(pos)
  }
  return otp
}

module.exports.generateOrderId = (length = 10) => {
  const letters = '1234567890'
  let orderId = 'ORD'
  for (let i = 0; i < length; i++) {
    const pos = parseInt(Math.floor(Math.random() * 9))
    orderId += letters.charAt(pos)
  }
  return orderId
}
