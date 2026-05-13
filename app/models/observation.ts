import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Plot from '#models/plot'
import CropType from '#models/crop_type'
import AppUser from '#models/app_user'
import Device from '#models/device'
import Attachment from '#models/attachment'
import { Auditable } from '#models/helpers/auditable'
import { compose } from '@adonisjs/core/helpers'

export default class Observation extends compose(BaseModel, Auditable) {
  static table = 'observations'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare plotId: string

  @column()
  declare cropTypeId: string

  @column.date()
  declare plantingDate: DateTime | null

  @column()
  declare expectedYieldKg: number | null

  @column()
  declare actualYieldKg: number | null

  @column.date()
  declare yieldEstimateDate: DateTime | null

  @column()
  declare growthStage: string | null

  @column()
  declare healthStatus: string | null

  @column()
  declare pestIssues: string | null

  @column()
  declare fertilizerUsed: boolean

  @column()
  declare notes: string | null

  @column()
  declare metadata: Record<string, unknown>

  @column()
  declare createdBy: string

  @column()
  declare deviceId: string | null

  @column.dateTime()
  declare clientCreatedAt: DateTime | null

  @column.dateTime()
  declare clientUpdatedAt: DateTime | null

  @column()
  declare version: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare deletedAt: DateTime | null

  @belongsTo(() => Plot)
  declare plot: BelongsTo<typeof Plot>

  @belongsTo(() => CropType)
  declare cropType: BelongsTo<typeof CropType>

  @belongsTo(() => AppUser, { foreignKey: 'createdBy' })
  declare creator: BelongsTo<typeof AppUser>

  @belongsTo(() => Device)
  declare device: BelongsTo<typeof Device>

  @hasMany(() => Attachment)
  declare attachments: HasMany<typeof Attachment>
}
