import vine from '@vinejs/vine'

/**
 * Shared rules for email and password.
 */
const email = () => vine.string().email().maxLength(254)
const password = () => vine.string().minLength(8).maxLength(32)
const deviceName = () => vine.string().trim().maxLength(80)

/**
 * Validator to use when performing self-signup
 */
export const signupValidator = vine.create({
  fullName: vine.string().trim().maxLength(120).nullable(),
  email: email().unique({ table: 'users', column: 'email' }),
  password: password(),
  passwordConfirmation: password().sameAs('password'),
  deviceName: deviceName().optional(),
})

/**
 * Validator to use before validating user credentials
 * during login
 */
export const loginValidator = vine.create({
  email: email(),
  password: vine.string(),
  deviceName: deviceName().optional(),
})

/**
 * Validator for refreshing an access token and optionally
 * assigning a new device-friendly token name.
 */
export const refreshTokenValidator = vine.create({
  deviceName: deviceName().optional(),
})

/**
 * Validator to revoke a specific token by identifier.
 */
export const revokeTokenValidator = vine.create({
  tokenId: vine.string().trim().maxLength(255),
})

/**
 * Validator for profile update payload.
 */
export const updateProfileValidator = vine.create({
  fullName: vine.string().trim().maxLength(120).nullable().optional(),
  email: email().optional(),
})

/**
 * Validator for account deletion confirmation.
 */
export const deleteAccountValidator = vine.create({
  password: vine.string(),
})

/**
 * Validators for forgot/reset password lifecycle.
 */
export const forgotPasswordValidator = vine.create({
  email: email(),
})

export const resetPasswordValidator = vine.create({
  token: vine.string().trim().maxLength(512),
  password: password(),
  passwordConfirmation: password().sameAs('password'),
})

/**
 * Validator for verifying email with a token.
 */
export const verifyEmailValidator = vine.create({
  token: vine.string().trim().maxLength(512),
})
