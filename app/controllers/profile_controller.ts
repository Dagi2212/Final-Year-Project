import User from '#models/user'
import UserTransformer from '#transformers/user_transformer'
import { deleteAccountValidator, updateProfileValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class ProfileController {
  async show({ auth, serialize }: HttpContext) {
    return serialize(UserTransformer.transform(auth.getUserOrFail()))
  }

  async update({ auth, request, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(updateProfileValidator)

    if (payload.email && payload.email !== user.email) {
      const existing = await User.query().where('email', payload.email).whereNot('id', user.id).first()
      if (existing) {
        return {
          message: 'Email is already in use',
        }
      }

      user.emailVerifiedAt = null
    }

    user.merge(payload)
    await user.save()

    return serialize(UserTransformer.transform(user))
  }

  async destroy({ auth, request }: HttpContext) {
    const user = auth.getUserOrFail()
    const { password } = await request.validateUsing(deleteAccountValidator)

    await User.verifyCredentials(user.email, password)
    await User.accessTokens.deleteAll(user)
    await user.delete()

    return {
      message: 'Account deleted successfully',
    }
  }
}
