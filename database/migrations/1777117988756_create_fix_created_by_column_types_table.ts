import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    // 1. Drop constraints pointing to app_users
    this.schema.alterTable('farmers', (table) => {
      table.dropForeign(['created_by'])
    })
    this.schema.alterTable('plots', (table) => {
      table.dropForeign(['created_by'])
    })
    this.schema.alterTable('observations', (table) => {
      table.dropForeign(['created_by'])
    })
    this.schema.alterTable('attachments', (table) => {
      table.dropForeign(['uploaded_by'])
    })
    this.schema.alterTable('sync_queue', (table) => {
      table.dropForeign(['user_id'])
    })

    // 2. Change column types to integer (assuming Postgres)
    // Note: We use raw because alter() with type change on UUID to Integer needs USING cast
    this.defer(async (db) => {
      await db.rawQuery('ALTER TABLE farmers ALTER COLUMN created_by TYPE INTEGER USING (NULL)')
      await db.rawQuery('ALTER TABLE plots ALTER COLUMN created_by TYPE INTEGER USING (NULL)')
      await db.rawQuery('ALTER TABLE observations ALTER COLUMN created_by TYPE INTEGER USING (NULL)')
      await db.rawQuery('ALTER TABLE attachments ALTER COLUMN uploaded_by TYPE INTEGER USING (NULL)')
      await db.rawQuery('ALTER TABLE sync_queue ALTER COLUMN user_id TYPE INTEGER USING (NULL)')
      
      // We use NULL for USING because existing UUIDs can't be converted to integers. 
      // This is acceptable if we are in a dev environment and want to fix the schema.
    })

    // 3. Add new constraints pointing to users table
    this.schema.alterTable('farmers', (table) => {
      table.foreign('created_by').references('id').inTable('users').onDelete('RESTRICT')
    })
    this.schema.alterTable('plots', (table) => {
      table.foreign('created_by').references('id').inTable('users').onDelete('RESTRICT')
    })
    this.schema.alterTable('observations', (table) => {
      table.foreign('created_by').references('id').inTable('users').onDelete('RESTRICT')
    })
    this.schema.alterTable('attachments', (table) => {
      table.foreign('uploaded_by').references('id').inTable('users').onDelete('RESTRICT')
    })
    this.schema.alterTable('sync_queue', (table) => {
      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE')
    })
  }

  async down() {
    // This is a one-way migration for fixing schema mismatch in dev.
  }
}