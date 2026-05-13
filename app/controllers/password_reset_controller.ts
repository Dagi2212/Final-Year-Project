import type { HttpContext } from '@adonisjs/core/http'

export default class PasswordResetController {
  async forgot({ response }: HttpContext) {
    return response.ok({ message: 'Password reset email sent (not yet implemented)' })
  }

  async reset({ response }: HttpContext) {
    return response.ok({ message: 'Password reset successful (not yet implemented)' })
  }
}
