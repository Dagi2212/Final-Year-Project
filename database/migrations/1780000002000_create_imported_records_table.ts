import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'imported_records'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('uuid_generate_v4()'))
      table.uuid('import_job_id').notNullable().references('id').inTable('import_jobs').onDelete('CASCADE')
      table.integer('source_row').notNullable().comment('1-based row number in the source file')

      // Agricultural yield fields (normalized)
      table.string('kebele', 255).nullable()
      table.string('region', 255).nullable()
      table.string('crop_name', 255).nullable()
      table.string('crop_category', 100).nullable()
      table.decimal('area_hectares', 10, 4).nullable()
      table.decimal('expected_yield_kg', 12, 4).nullable()
      table.decimal('actual_yield_kg', 12, 4).nullable()
      table.decimal('rainfall_mm', 10, 2).nullable()
      table.decimal('temperature_celsius', 6, 2).nullable()
      table.string('season', 100).nullable().comment('e.g. belg, meher, main, short-rains')
      table.integer('year').nullable()
      table.date('planting_date').nullable()
      table.date('harvest_date').nullable()
      table.string('fertilizer_type', 255).nullable()
      table.decimal('fertilizer_amount_kg', 10, 2).nullable()
      table.string('pesticide_used', 255).nullable()
      table.string('irrigation_type', 100).nullable()
      table.string('soil_type', 100).nullable()

      // Raw / un-mapped values stored for traceability
      table.jsonb('raw_values').nullable()

      table
        .enu('status', ['valid', 'invalid', 'skipped'], {
          useNative: true,
          enumName: 'imported_record_status_enum',
          existingType: false,
        })
        .notNullable()
        .defaultTo('valid')
      table.jsonb('validation_errors').nullable()

      table.timestamp('created_at', { useTz: true }).defaultTo(this.raw('NOW()'))

      table.index(['import_job_id'], 'idx_imported_records_job')
      table.index(['crop_name', 'year', 'season'], 'idx_imported_records_timeseries')
      table.index(['kebele', 'region'], 'idx_imported_records_location')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
    this.defer(async (db) => {
      await db.rawQuery('DROP TYPE IF EXISTS imported_record_status_enum CASCADE')
    })
  }
}
