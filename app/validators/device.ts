import vine from '@vinejs/vine'

export const createDeviceValidator = vine.compile(
  vine.object({
    userId: vine.string().uuid(),
    deviceName: vine.string().trim().maxLength(100).optional(),
    deviceUuid: vine.string().trim().maxLength(255),
  })
)

export const updateDeviceValidator = vine.compile(
  vine.object({
    deviceName: vine.string().trim().maxLength(100).optional(),
    lastSyncAt: vine.date().optional(),
  })
)
