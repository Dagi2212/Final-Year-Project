import type { HttpContext } from '@adonisjs/core/http'

export default class EmailVerificationController {
  async send({ response }: HttpContext) {
    return response.ok({ message: 'Verification email sent (not yet implemented)' })
  }

  async verify({ request, response }: HttpContext) {
    const { token } = request.all()
    
    if (!token) {
      return response.badRequest({ message: 'Verification token is required' })
    }

    // Basic implementation since there's no DB table for tokens yet
    return response.ok({ message: 'Email successfully verified' })
  }
}
