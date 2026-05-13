import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'audit_logs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('uuid_generate_v4()'))
      table.uuid('user_id').nullable().references('id').inTable('app_users')
      table.string('table_name', 50).notNullable()
      table.uuid('record_id').notNullable()
      table.string('action', 20).notNullable()
      table.jsonb('old_values').nullable()
      table.jsonb('new_values').nullable()
      table.specificType('ip_address', 'inet').nullable()
      table.text('user_agent').nullable()
      table.timestamp('created_at', { useTz: true }).defaultTo(this.raw('NOW()'))

      table.index(['table_name', 'record_id'], 'idx_audit_table_record')
      table.index(['created_at'], 'idx_audit_created')
    })

    this.defer(async (db) => {
      await db.rawQuery(`ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_action_check CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'SYNC'))`)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
