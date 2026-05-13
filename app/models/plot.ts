import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Farmer from '#models/farmer'
import AppUser from '#models/app_user'
import Device from '#models/device'
import Observation from '#models/observation'
import { Auditable } from '#models/helpers/auditable'
import { compose } from '@adonisjs/core/helpers'

export default class Plot extends compose(BaseModel, Auditable) {
  static table = 'plots'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare farmerId: string

  @column()
  declare plotName: string | null

  @column()
  declare areaSqm: number | null

  @column()
  declare areaLocal: string | null

  @column()
  declare latitude: number | null

  @column()
  declare longitude: number | null

  @column()
  declare altitude: number | null

  @column()
  declare soilType: string | null

  @column()
  declare irrigation: boolean

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

  @belongsTo(() => Farmer)
  declare farmer: BelongsTo<typeof Farmer>

  @belongsTo(() => AppUser, { foreignKey: 'createdBy' })
  declare creator: BelongsTo<typeof AppUser>

  @belongsTo(() => Device)
  declare device: BelongsTo<typeof Device>

  @hasMany(() => Observation)
  declare observations: HasMany<typeof Observation>
}
