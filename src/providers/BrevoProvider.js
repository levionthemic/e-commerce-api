/**
 * Send mail by Brevo service
 */

const SibApiV3Sdk = require('@getbrevo/brevo')
import { env } from '~/config/environment'

let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi()
let apiKey = apiInstance.authentications['apiKey']
apiKey.apiKey = env.BREVO_API_KEY

const sendEmail = async (recipientEmail, customSubject, htmlContent) => {
  // Initiate a sendSmtpEmail with needed information
  let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail()

  // Account for sending email
  // Notice that this emial is the same as the email used for registering on Brevo
  sendSmtpEmail.sender = { email: env.ADMIN_EMAIL_ADDRESS, name: env.ADMIN_EMAIL_NAME }

  // Accounts for receiving email
  // 'to' should be an array for later convenience when we send a email to many users.
  sendSmtpEmail.to = [{ email: recipientEmail }]

  // Email's subject
  sendSmtpEmail.subject = customSubject

  // Email's HTML content
  sendSmtpEmail.htmlContent = htmlContent

  // Call a method to send mail
  // sendTransacEmail() returns a Promise
  return apiInstance.sendTransacEmail(sendSmtpEmail)
}

export const BrevoProvider = {
  sendEmail
}
