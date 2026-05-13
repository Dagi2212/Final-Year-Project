import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export type ProductType = 'dataset_export' | 'analytics_report' | 'subscription' | 'pay_per_query'

export default class Product extends BaseModel {
  static table = 'products'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare description: string | null

  @column()
  declare productType: ProductType

  @column()
  declare priceUsd: number

  @column()
  declare isActive: boolean

  @column()
  declare metadata: Record<string, unknown> | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
