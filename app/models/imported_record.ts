import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import ImportJob from '#models/import_job'

export type ImportedRecordStatus = 'valid' | 'invalid' | 'skipped'

export default class ImportedRecord extends BaseModel {
  static table = 'imported_records'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare importJobId: string

  @column()
  declare sourceRow: number

  @column()
  declare kebele: string | null

  @column()
  declare region: string | null

  @column()
  declare cropName: string | null

  @column()
  declare cropCategory: string | null

  @column()
  declare areaHectares: number | null

  @column()
  declare expectedYieldKg: number | null

  @column()
  declare actualYieldKg: number | null

  @column()
  declare rainfallMm: number | null

  @column()
  declare temperatureCelsius: number | null

  @column()
  declare season: string | null

  @column()
  declare year: number | null

  @column.date()
  declare plantingDate: DateTime | null

  @column.date()
  declare harvestDate: DateTime | null

  @column()
  declare fertilizerType: string | null

  @column()
  declare fertilizerAmountKg: number | null

  @column()
  declare pesticideUsed: string | null

  @column()
  declare irrigationType: string | null

  @column()
  declare soilType: string | null

  @column()
  declare rawValues: Record<string, unknown> | null

  @column()
  declare status: ImportedRecordStatus

  @column()
  declare validationErrors: string[] | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => ImportJob)
  declare importJob: BelongsTo<typeof ImportJob>
}
