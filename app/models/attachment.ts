import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Observation from '#models/observation'
import AppUser from '#models/app_user'
import Device from '#models/device'

export default class Attachment extends BaseModel {
  static table = 'attachments'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare observationId: string | null

  @column()
  declare fileUrl: string

  @column()
  declare fileType: string | null

  @column()
  declare fileSizeBytes: number | null

  @column()
  declare caption: string | null

  @column()
  declare uploadedBy: string

  @column()
  declare deviceId: string | null

  @column.dateTime()
  declare clientCreatedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => Observation)
  declare observation: BelongsTo<typeof Observation>

  @belongsTo(() => AppUser, { foreignKey: 'uploadedBy' })
  declare uploader: BelongsTo<typeof AppUser>

  @belongsTo(() => Device)
  declare device: BelongsTo<typeof Device>
}
