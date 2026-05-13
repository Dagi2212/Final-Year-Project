import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class CropType extends BaseModel {
  static table = 'crop_types'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare localName: string | null

  @column()
  declare category: string | null

  @column()
  declare description: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime
}
