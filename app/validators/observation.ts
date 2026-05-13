import vine from '@vinejs/vine'

export const createObservationValidator = vine.compile(
  vine.object({
    plotId: vine.string().uuid(),
    cropTypeId: vine.string().uuid(),
    plantingDate: vine.date().optional(),
    expectedYieldKg: vine.number().positive().optional(),
    actualYieldKg: vine.number().positive().optional(),
    yieldEstimateDate: vine.date().optional(),
    growthStage: vine.string().trim().maxLength(50).optional(),
    healthStatus: vine.string().trim().maxLength(50).optional(),
    pestIssues: vine.string().trim().optional(),
    fertilizerUsed: vine.boolean().optional(),
    notes: vine.string().trim().optional(),
    metadata: vine.object({}).allowUnknownProperties().optional(),
    createdBy: vine.string().uuid(),
    deviceId: vine.string().uuid().optional(),
    clientCreatedAt: vine.date().optional(),
    clientUpdatedAt: vine.date().optional(),
  })
)

export const updateObservationValidator = vine.compile(
  vine.object({
    cropTypeId: vine.string().uuid().optional(),
    plantingDate: vine.date().optional(),
    expectedYieldKg: vine.number().positive().optional(),
    actualYieldKg: vine.number().positive().optional(),
    yieldEstimateDate: vine.date().optional(),
    growthStage: vine.string().trim().maxLength(50).optional(),
    healthStatus: vine.string().trim().maxLength(50).optional(),
    pestIssues: vine.string().trim().optional(),
    fertilizerUsed: vine.boolean().optional(),
    notes: vine.string().trim().optional(),
    metadata: vine.object({}).allowUnknownProperties().optional(),
    deviceId: vine.string().uuid().optional(),
    clientUpdatedAt: vine.date().optional(),
    version: vine.number().optional(),
  })
)
