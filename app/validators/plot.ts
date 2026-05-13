import vine from '@vinejs/vine'

export const createPlotValidator = vine.compile(
  vine.object({
    farmerId: vine.string().uuid(),
    plotName: vine.string().trim().maxLength(100).optional(),
    areaSqm: vine.number().positive().optional(),
    areaLocal: vine.string().trim().maxLength(50).optional(),
    latitude: vine.number().min(-90).max(90).optional(),
    longitude: vine.number().min(-180).max(180).optional(),
    altitude: vine.number().optional(),
    soilType: vine.string().trim().maxLength(50).optional(),
    irrigation: vine.boolean().optional(),
    createdBy: vine.string().uuid(),
    deviceId: vine.string().uuid().optional(),
    clientCreatedAt: vine.date().optional(),
    clientUpdatedAt: vine.date().optional(),
  })
)

export const updatePlotValidator = vine.compile(
  vine.object({
    plotName: vine.string().trim().maxLength(100).optional(),
    areaSqm: vine.number().positive().optional(),
    areaLocal: vine.string().trim().maxLength(50).optional(),
    latitude: vine.number().min(-90).max(90).optional(),
    longitude: vine.number().min(-180).max(180).optional(),
    altitude: vine.number().optional(),
    soilType: vine.string().trim().maxLength(50).optional(),
    irrigation: vine.boolean().optional(),
    deviceId: vine.string().uuid().optional(),
    clientUpdatedAt: vine.date().optional(),
    version: vine.number().optional(),
  })
)
