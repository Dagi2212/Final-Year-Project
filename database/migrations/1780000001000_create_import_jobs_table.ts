import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'import_jobs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('uuid_generate_v4()'))
      table.uuid('created_by').nullable().references('id').inTable('app_users').onDelete('SET NULL')
      table.string('file_name', 500).notNullable()
      table.string('file_type', 20).notNullable().comment('csv | xlsx')
      table.bigInteger('file_size_bytes').nullable()
      table
        .enu('status', ['pending', 'processing', 'completed', 'failed'], {
          useNative: true,
          enumName: 'import_job_status_enum',
          existingType: false,
        })
        .notNullable()
        .defaultTo('pending')
      table.integer('total_rows').nullable()
      table.integer('imported_rows').nullable()
      table.integer('skipped_rows').nullable()
      table.jsonb('schema_mapping').nullable().comment('detected column → field mapping')
      table.jsonb('validation_errors').nullable()
      table.text('error_message').nullable()
      table.timestamp('started_at', { useTz: true }).nullable()
      table.timestamp('completed_at', { useTz: true }).nullable()
      table.timestamp('created_at', { useTz: true }).defaultTo(this.raw('NOW()'))
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.raw('NOW()'))

      table.index(['created_by'], 'idx_import_jobs_user')
      table.index(['status'], 'idx_import_jobs_status')
      table.index(['created_at'], 'idx_import_jobs_created')
    })

    this.defer(async (db) => {
      await db.rawQuery(`
        CREATE TRIGGER update_import_jobs_updated_at
        BEFORE UPDATE ON import_jobs
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
      `)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
    this.defer(async (db) => {
      await db.rawQuery('DROP TYPE IF EXISTS import_job_status_enum CASCADE')
    })
  }
}
