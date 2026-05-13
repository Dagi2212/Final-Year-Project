import vine from '@vinejs/vine'

export const createSyncQueueValidator = vine.compile(
  vine.object({
    deviceId: vine.string().uuid(),
    userId: vine.string().uuid(),
    batchId: vine.string().trim().maxLength(255),
    entityType: vine.enum(['farmer', 'plot', 'observation', 'attachment']),
    entityId: vine.string().uuid().optional(),
    operation: vine.enum(['CREATE', 'UPDATE', 'DELETE']),
    payload: vine.object({}).allowUnknownProperties(),
    clientTimestamp: vine.date(),
  })
)

export const updateSyncQueueStatusValidator = vine.compile(
  vine.object({
    status: vine.enum(['pending', 'processing', 'completed', 'failed', 'conflict']),
    errorMessage: vine.string().trim().optional(),
    entityId: vine.string().uuid().optional(),
    resolvedAt: vine.date().optional(),
  })
)
