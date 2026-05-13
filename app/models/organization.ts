import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Farmer from '#models/farmer'
import User from '#models/user'
import { Auditable } from '#models/helpers/auditable'
import { compose } from '@adonisjs/core/helpers'

export default class Organization extends compose(BaseModel, Auditable) {
  static table = 'organizations'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare type: 'cooperative' | 'ngo' | 'government' | 'private' | null

  @column()
  declare region: string | null

  @column()
  declare contactPhone: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => Farmer)
  declare farmers: HasMany<typeof Farmer>

  @hasMany(() => User)
  declare users: HasMany<typeof User>
}
