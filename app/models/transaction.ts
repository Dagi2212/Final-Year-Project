import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import AppUser from '#models/app_user'
import Product from '#models/product'
import Subscription from '#models/subscription'

export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'refunded'

export default class Transaction extends BaseModel {
  static table = 'transactions'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare productId: string | null

  @column()
  declare subscriptionId: string | null

  @column()
  declare amountUsd: number

  @column()
  declare currency: string

  @column()
  declare status: TransactionStatus

  @column()
  declare paymentProvider: string | null

  @column()
  declare paymentReference: string | null

  @column()
  declare paymentMetadata: Record<string, unknown> | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => AppUser)
  declare user: BelongsTo<typeof AppUser>

  @belongsTo(() => Product)
  declare product: BelongsTo<typeof Product>

  @belongsTo(() => Subscription)
  declare subscription: BelongsTo<typeof Subscription>
}
