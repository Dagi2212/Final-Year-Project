import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import AppUser from '#models/app_user'

export default class DatasetPermission extends BaseModel {
  static table = 'dataset_permissions'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare datasetType: string

  @column()
  declare datasetId: string | null

  @column()
  declare permissions: string[]

  @column()
  declare grantedBy: string | null

  @column.dateTime()
  declare expiresAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => AppUser, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof AppUser>
}
