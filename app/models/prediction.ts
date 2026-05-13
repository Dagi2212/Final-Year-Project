import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import AppUser from '#models/app_user'

export type PredictionStatus = 'pending' | 'completed' | 'failed'

export default class Prediction extends BaseModel {
  static table = 'predictions'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare requestedBy: string | null

  @column()
  declare importJobId: string | null

  @column()
  declare importedRecordId: string | null

  @column()
  declare modelVersion: string

  @column()
  declare modelType: string

  @column()
  declare inputFeatures: Record<string, unknown>

  @column()
  declare predictedYieldKg: number | null

  @column()
  declare confidenceScore: number | null

  @column()
  declare rawOutput: Record<string, unknown> | null

  @column()
  declare status: PredictionStatus

  @column()
  declare errorMessage: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => AppUser, { foreignKey: 'requestedBy' })
  declare requester: BelongsTo<typeof AppUser>
}
