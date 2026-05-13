import vine from '@vinejs/vine'

export const createOrganizationValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255),
    type: vine.enum(['cooperative', 'ngo', 'government', 'private']).optional(),
    region: vine.string().trim().maxLength(100).optional(),
    contactPhone: vine.string().trim().maxLength(20).optional(),
  })
)

export const updateOrganizationValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255).optional(),
    type: vine.enum(['cooperative', 'ngo', 'government', 'private']).optional(),
    region: vine.string().trim().maxLength(100).optional(),
    contactPhone: vine.string().trim().maxLength(20).optional(),
  })
)
