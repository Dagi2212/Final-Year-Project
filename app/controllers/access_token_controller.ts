import User from '#models/user'
import { ACCESS_TOKEN_EXPIRES_IN } from '#services/auth_constants'
import { loginValidator, refreshTokenValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'
import UserTransformer from '#transformers/user_transformer'

export default class AccessTokenController {
  async store({ request, serialize }: HttpContext) {
    const { email, password, deviceName } = await request.validateUsing(loginValidator)

    const user = await User.verifyCredentials(email, password)
    const token = await User.accessTokens.create(user, ['*'], {
      name: deviceName ?? 'api-client',
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    })

    return serialize({
      user: UserTransformer.transform(user),
      token: token.value!.release(),
    })
  }

  async refresh({ auth, request, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const currentToken = user.currentAccessToken

    if (!currentToken) {
      return {
        message: 'No active token found',
      }
    }

    const { deviceName } = await request.validateUsing(refreshTokenValidator)
    const token = await User.accessTokens.create(user, ['*'], {
      name: deviceName ?? currentToken.name ?? 'api-client',
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    })

    await User.accessTokens.delete(user, currentToken.identifier)

    return serialize({
      user: UserTransformer.transform(user),
      token: token.value!.release(),
    })
  }

  async index({ auth, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const tokens = await User.accessTokens.all(user)

    return serialize(
      tokens.map((token) => ({
        id: String(token.identifier),
        name: token.name,
        type: token.type,
        createdAt: token.createdAt,
        updatedAt: token.updatedAt,
        lastUsedAt: token.lastUsedAt,
        expiresAt: token.expiresAt,
        isCurrent: user.currentAccessToken?.identifier === token.identifier,
      }))
    )
  }

  async revoke({ auth, params }: HttpContext) {
    const user = auth.getUserOrFail()
    const tokenId = String(params.tokenId || '').trim()

    if (!tokenId) {
      return {
        message: 'tokenId is required',
      }
    }

    await User.accessTokens.delete(user, tokenId)

    return {
      message: 'Token revoked successfully',
    }
  }

  async destroy({ auth }: HttpContext) {
    const user = auth.getUserOrFail()
    if (user.currentAccessToken) {
      await User.accessTokens.delete(user, user.currentAccessToken.identifier)
    }

    return {
      message: 'Logged out successfully',
    }
  }

  async destroyAll({ auth }: HttpContext) {
    const user = auth.getUserOrFail()
    await User.accessTokens.deleteAll(user)

    return {
      message: 'Logged out from all devices successfully',
    }
  }
}
