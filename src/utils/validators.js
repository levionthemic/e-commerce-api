export const OBJECT_ID_RULE = /^[0-9a-fA-F]{24}$/
export const OBJECT_ID_RULE_MESSAGE = 'Your string fails to match the Object Id pattern!'

export const FIELD_REQUIRED_MESSAGE = 'Trường này không được để trống!'
export const EMAIL_RULE = /^\S+@\S+\.\S+$/
export const EMAIL_RULE_MESSAGE = 'Email không hợp lệ. (example@levion.com)'
export const PASSWORD_RULE = /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d\W]{8,256}$/
export const PASSWORD_RULE_MESSAGE = 'Password must include at least 1 letter, a number, and at least 8 characters.'
export const PASSWORD_CONFIRMATION_MESSAGE = 'Password Confirmation does not match!'
export const PHONE_RULE = /^0(2|3|5|7|8|9)\d{8}$/
export const PHONE_RULE_MESSAGE = 'Số điện thoại không hợp lí.'
