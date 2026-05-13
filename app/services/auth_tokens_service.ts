import string from '@adonisjs/core/helpers/string'

export default class AuthTokensService {
  static async createEmailVerificationToken(_userId: number | string) {
    return { token: string.generateRandom(32) }
  }
}
