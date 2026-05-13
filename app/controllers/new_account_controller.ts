import User from '#models/user'
import AuthMailService from '#services/auth_mail_service'
import AuthTokensService from '#services/auth_tokens_service'
import { ACCESS_TOKEN_EXPIRES_IN } from '#services/auth_constants'
import { signupValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'
import UserTransformer from '#transformers/user_transformer'

export default class NewAccountController {
  async store({ request, serialize }: HttpContext) {
    const { fullName, email, password, deviceName } = await request.validateUsing(signupValidator)

    const user = await User.create({ fullName, email, password })
    const token = await User.accessTokens.create(user, ['*'], {
      name: deviceName ?? 'api-client',
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    })

    const verification = await AuthTokensService.createEmailVerificationToken(user.id)
    await AuthMailService.sendEmailVerificationEmail(user, verification.token)

    return serialize({
      user: UserTransformer.transform(user),
      token: token.value!.release(),
    })
  }
}
