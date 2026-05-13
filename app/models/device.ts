import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import AppUser from '#models/app_user'
import { Auditable } from '#models/helpers/auditable'
import { compose } from '@adonisjs/core/helpers'

export default class Device extends compose(BaseModel, Auditable) {
  static table = 'devices'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare deviceName: string | null

  @column()
  declare deviceUuid: string

  @column.dateTime()
  declare lastSyncAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => AppUser, {
    foreignKey: 'userId',
  })
  declare user: BelongsTo<typeof AppUser>
}
