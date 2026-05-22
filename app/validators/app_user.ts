import vine from '@vinejs/vine'

export const createAppUserValidator = vine.compile(
  vine.object({
    organizationId: vine.string().uuid().optional(),
    email: vine.string().email().maxLength(255).optional(),
    passwordHash: vine.string().maxLength(255).optional(),
    fullName: vine.string().trim().minLength(1).maxLength(255),
    phone: vine.string().trim().maxLength(20).optional(),
    role: vine.enum(['admin', 'field_agent', 'supervisor', 'gov', 'ngo', 'trader', 'researcher']).optional(),
    isActive: vine.boolean().optional(),
  })
)

export const updateAppUserValidator = vine.compile(
  vine.object({
    organizationId: vine.string().uuid().optional(),
    email: vine.string().email().maxLength(255).optional(),
    passwordHash: vine.string().maxLength(255).optional(),
    fullName: vine.string().trim().minLength(1).maxLength(255).optional(),
    phone: vine.string().trim().maxLength(20).optional(),
    role: vine.enum(['admin', 'field_agent', 'supervisor', 'gov', 'ngo', 'trader', 'researcher']).optional(),
    isActive: vine.boolean().optional(),
  })
)
