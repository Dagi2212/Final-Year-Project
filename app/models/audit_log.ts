import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import AppUser from '#models/app_user'

export default class AuditLog extends BaseModel {
  static table = 'audit_logs'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string | null

  @column()
  declare tableName: string

  @column()
  declare recordId: string

  @column()
  declare action: 'INSERT' | 'UPDATE' | 'DELETE' | 'SYNC' | 'IMPORT' | 'PREDICT' | 'QUERY' | 'EXPORT' | 'PAYMENT'

  @column()
  declare oldValues: Record<string, unknown> | null

  @column()
  declare newValues: Record<string, unknown> | null

  @column()
  declare ipAddress: string | null

  @column()
  declare userAgent: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => AppUser, {
    foreignKey: 'userId',
  })
  declare user: BelongsTo<typeof AppUser>
}
