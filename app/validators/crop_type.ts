import vine from '@vinejs/vine'

export const createCropTypeValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(100),
    localName: vine.string().trim().maxLength(100).optional(),
    category: vine.string().trim().maxLength(50).optional(),
    description: vine.string().trim().optional(),
  })
)

export const updateCropTypeValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(100).optional(),
    localName: vine.string().trim().maxLength(100).optional(),
    category: vine.string().trim().maxLength(50).optional(),
    description: vine.string().trim().optional(),
  })
)
