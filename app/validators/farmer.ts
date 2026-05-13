import vine from '@vinejs/vine'

export const createFarmerValidator = vine.compile(
  vine.object({
    organizationId: vine.string().uuid().optional(),
    fullName: vine.string().trim().minLength(1).maxLength(255),
    phone: vine.string().trim().maxLength(20).optional(),
    locationRegion: vine.string().trim().maxLength(100).optional(),
    locationZone: vine.string().trim().maxLength(100).optional(),
    locationWoreda: vine.string().trim().maxLength(100).optional(),
    householdSize: vine.number().min(1).optional(),
    notes: vine.string().trim().optional(),
    createdBy: vine.string().uuid(),
    deviceId: vine.string().uuid().optional(),
    clientCreatedAt: vine.date().optional(),
    clientUpdatedAt: vine.date().optional(),
  })
)

export const updateFarmerValidator = vine.compile(
  vine.object({
    organizationId: vine.string().uuid().optional(),
    fullName: vine.string().trim().minLength(1).maxLength(255).optional(),
    phone: vine.string().trim().maxLength(20).optional(),
    locationRegion: vine.string().trim().maxLength(100).optional(),
    locationZone: vine.string().trim().maxLength(100).optional(),
    locationWoreda: vine.string().trim().maxLength(100).optional(),
    householdSize: vine.number().min(1).optional(),
    notes: vine.string().trim().optional(),
    deviceId: vine.string().uuid().optional(),
    clientUpdatedAt: vine.date().optional(),
  })
)
