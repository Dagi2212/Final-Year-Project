import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import AppUser from '#models/app_user'
import ImportedRecord from '#models/imported_record'

export type ImportJobStatus = 'pending' | 'processing' | 'completed' | 'failed'

export default class ImportJob extends BaseModel {
  static table = 'import_jobs'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare createdBy: string | null

  @column()
  declare fileName: string

  @column()
  declare fileType: 'csv' | 'xlsx'

  @column()
  declare fileSizeBytes: number | null

  @column()
  declare status: ImportJobStatus

  @column()
  declare totalRows: number | null

  @column()
  declare importedRows: number | null

  @column()
  declare skippedRows: number | null

  @column()
  declare schemaMapping: Record<string, string> | null

  @column()
  declare validationErrors: Record<string, unknown>[] | null

  @column()
  declare errorMessage: string | null

  @column.dateTime()
  declare startedAt: DateTime | null

  @column.dateTime()
  declare completedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => AppUser, { foreignKey: 'createdBy' })
  declare creator: BelongsTo<typeof AppUser>

  @hasMany(() => ImportedRecord, { foreignKey: 'importJobId' })
  declare records: HasMany<typeof ImportedRecord>
}
