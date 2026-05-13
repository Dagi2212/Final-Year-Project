import mail from '@adonisjs/mail/services/main'
import User from '#models/user'
import logger from '@adonisjs/core/services/logger'
import env from '#start/env'

export default class AuthMailService {
  static async sendEmailVerificationEmail(user: User, token: string) {
    try {
      const frontendUrl = env.get('FRONTEND_URL')
      const verificationLink = `${frontendUrl}/verify-email?token=${token}`

      await mail.send((message) => {
        message
          .to(user.email)
          .subject('Verify your email address')
          .text(`Please verify your email address by clicking the following link:\n\n${verificationLink}`)
      })
      logger.info(`Email verification sent to ${user.email}`)
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED') {
        logger.error(`Could not send email to ${user.email} because SMTP server is not running. Verification Token: ${token}`)
      } else {
        logger.error(`Failed to send email verification to ${user.email}: ${error.message}`)
      }
    }
  }
}
