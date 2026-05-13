import vine from '@vinejs/vine'

export const createAttachmentValidator = vine.compile(
  vine.object({
    observationId: vine.string().uuid().optional(),
    fileUrl: vine.string().url().maxLength(2048),
    fileType: vine.string().trim().maxLength(50).optional(),
    fileSizeBytes: vine.number().positive().optional(),
    caption: vine.string().trim().maxLength(255).optional(),
    uploadedBy: vine.string().uuid(),
    deviceId: vine.string().uuid().optional(),
    clientCreatedAt: vine.date().optional(),
  })
)

export const updateAttachmentValidator = vine.compile(
  vine.object({
    caption: vine.string().trim().maxLength(255).optional(),
    fileType: vine.string().trim().maxLength(50).optional(),
  })
)
