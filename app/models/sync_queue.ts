import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Device from '#models/device'
import AppUser from '#models/app_user'

export default class SyncQueue extends BaseModel {
  static table = 'sync_queue'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare deviceId: string

  @column()
  declare userId: string

  @column()
  declare batchId: string

  @column()
  declare entityType: 'farmer' | 'plot' | 'observation' | 'attachment'

  @column()
  declare entityId: string | null

  @column()
  declare operation: 'CREATE' | 'UPDATE' | 'DELETE'

  @column()
  declare payload: Record<string, unknown>

  @column.dateTime()
  declare clientTimestamp: DateTime

  @column()
  declare status: 'pending' | 'processing' | 'completed' | 'failed' | 'conflict'

  @column()
  declare retryCount: number

  @column()
  declare errorMessage: string | null

  @column.dateTime()
  declare resolvedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare serverTimestamp: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime()
  declare processedAt: DateTime | null

  @belongsTo(() => Device)
  declare device: BelongsTo<typeof Device>

  @belongsTo(() => AppUser, {
    foreignKey: 'userId',
  })
  declare user: BelongsTo<typeof AppUser>
}
