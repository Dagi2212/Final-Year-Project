import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'audit_logs'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign(['user_id'])
    })

    this.defer(async (db) => {
      // Convert user_id and record_id to VARCHAR to support both UUIDs and Integers
      await db.rawQuery('ALTER TABLE audit_logs ALTER COLUMN user_id TYPE VARCHAR(255) USING user_id::VARCHAR')
      await db.rawQuery('ALTER TABLE audit_logs ALTER COLUMN record_id TYPE VARCHAR(255) USING record_id::VARCHAR')
    })
  }

  async down() {
    this.defer(async (db) => {
      // Revert back to UUID if possible (might fail if they contain non-UUID data)
      await db.rawQuery('ALTER TABLE audit_logs ALTER COLUMN user_id TYPE UUID USING user_id::UUID')
      await db.rawQuery('ALTER TABLE audit_logs ALTER COLUMN record_id TYPE UUID USING record_id::UUID')
    })

    this.schema.alterTable(this.tableName, (table) => {
      table.foreign('user_id').references('id').inTable('app_users')
    })
  }
}