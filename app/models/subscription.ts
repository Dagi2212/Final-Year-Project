import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import AppUser from '#models/app_user'
import Product from '#models/product'

export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'pending'

export default class Subscription extends BaseModel {
  static table = 'subscriptions'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare productId: string

  @column()
  declare status: SubscriptionStatus

  @column.dateTime()
  declare startsAt: DateTime | null

  @column.dateTime()
  declare expiresAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => AppUser)
  declare user: BelongsTo<typeof AppUser>

  @belongsTo(() => Product)
  declare product: BelongsTo<typeof Product>
}
