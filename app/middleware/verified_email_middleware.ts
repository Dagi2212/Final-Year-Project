import type { HttpContext } from '@adonisjs/core/http'

export default class VerifiedEmailMiddleware {
  async handle({ auth, response }: HttpContext, next: () => Promise<void>) {
    const user = auth.getUserOrFail()
    if (!user.emailVerifiedAt) {
      return response.unauthorized({ message: 'Please verify your email address' })
    }
    await next()
  }
}
