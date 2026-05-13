import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Organization from '#models/organization'
import Device from '#models/device'
import { Auditable } from '#models/helpers/auditable'
import { compose } from '@adonisjs/core/helpers'

export default class AppUser extends compose(BaseModel, Auditable) {
  static table = 'app_users'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare organizationId: string | null

  @column()
  declare email: string | null

  @column({ serializeAs: null })
  declare passwordHash: string | null

  @column()
  declare fullName: string

  @column()
  declare phone: string | null

  @column()
  declare role: 'admin' | 'field_agent' | 'supervisor' | null

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Organization)
  declare organization: BelongsTo<typeof Organization>

  @hasMany(() => Device, {
    foreignKey: 'userId',
  })
  declare devices: HasMany<typeof Device>
}
