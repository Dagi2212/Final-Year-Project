import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'predictions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('uuid_generate_v4()'))
      table.uuid('requested_by').nullable().references('id').inTable('app_users').onDelete('SET NULL')
      table.uuid('import_job_id').nullable().references('id').inTable('import_jobs').onDelete('SET NULL')
      table.uuid('imported_record_id').nullable().references('id').inTable('imported_records').onDelete('SET NULL')
      table.string('model_version', 50).notNullable()
      table.string('model_type', 100).notNullable().defaultTo('yield_regression')
      table.jsonb('input_features').notNullable()
      table.decimal('predicted_yield_kg', 12, 4).nullable()
      table.decimal('confidence_score', 5, 4).nullable()
      table.jsonb('raw_output').nullable()
      table
        .enu('status', ['pending', 'completed', 'failed'], {
          useNative: true,
          enumName: 'prediction_status_enum',
          existingType: false,
        })
        .notNullable()
        .defaultTo('pending')
      table.text('error_message').nullable()
      table.timestamp('created_at', { useTz: true }).defaultTo(this.raw('NOW()'))
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.raw('NOW()'))

      table.index(['requested_by'], 'idx_predictions_user')
      table.index(['import_job_id'], 'idx_predictions_import')
      table.index(['status'], 'idx_predictions_status')
      table.index(['model_version'], 'idx_predictions_model')
    })

    this.defer(async (db) => {
      await db.rawQuery(`
        CREATE TRIGGER update_predictions_updated_at
        BEFORE UPDATE ON predictions
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
      `)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
    this.defer(async (db) => {
      await db.rawQuery('DROP TYPE IF EXISTS prediction_status_enum CASCADE')
    })
  }
}
