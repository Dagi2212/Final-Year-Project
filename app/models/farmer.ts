import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Organization from '#models/organization'
import AppUser from '#models/app_user'
import Device from '#models/device'
import Plot from '#models/plot'
import { Auditable } from '#models/helpers/auditable'
import { compose } from '@adonisjs/core/helpers'

export default class Farmer extends compose(BaseModel, Auditable) {
  static table = 'farmers'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare organizationId: string | null

  @column()
  declare fullName: string

  @column()
  declare phone: string | null

  @column()
  declare locationRegion: string | null

  @column()
  declare locationZone: string | null

  @column()
  declare locationWoreda: string | null

  @column()
  declare householdSize: number | null

  @column()
  declare notes: string | null

  @column()
  declare createdBy: string

  @column()
  declare deviceId: string | null

  @column.dateTime()
  declare clientCreatedAt: DateTime | null

  @column.dateTime()
  declare clientUpdatedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare deletedAt: DateTime | null

  @belongsTo(() => Organization)
  declare organization: BelongsTo<typeof Organization>

  @belongsTo(() => AppUser, { foreignKey: 'createdBy' })
  declare creator: BelongsTo<typeof AppUser>

  @belongsTo(() => Device)
  declare device: BelongsTo<typeof Device>

  @hasMany(() => Plot)
  declare plots: HasMany<typeof Plot>
}
