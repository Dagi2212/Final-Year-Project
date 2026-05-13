import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    // 1. Drop constraints pointing to users
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

    // 2. Change column types to UUID
    this.defer(async (db) => {
      await db.rawQuery('ALTER TABLE farmers ALTER COLUMN created_by TYPE UUID USING (NULL)')
      await db.rawQuery('ALTER TABLE plots ALTER COLUMN created_by TYPE UUID USING (NULL)')
      await db.rawQuery('ALTER TABLE observations ALTER COLUMN created_by TYPE UUID USING (NULL)')
      await db.rawQuery('ALTER TABLE attachments ALTER COLUMN uploaded_by TYPE UUID USING (NULL)')
      await db.rawQuery('ALTER TABLE sync_queue ALTER COLUMN user_id TYPE UUID USING (NULL)')
    })

    // 3. Add new constraints pointing back to app_users table
    this.schema.alterTable('farmers', (table) => {
      table.foreign('created_by').references('id').inTable('app_users').onDelete('RESTRICT')
    })
    this.schema.alterTable('plots', (table) => {
      table.foreign('created_by').references('id').inTable('app_users').onDelete('RESTRICT')
    })
    this.schema.alterTable('observations', (table) => {
      table.foreign('created_by').references('id').inTable('app_users').onDelete('RESTRICT')
    })
    this.schema.alterTable('attachments', (table) => {
      table.foreign('uploaded_by').references('id').inTable('app_users').onDelete('RESTRICT')
    })
    this.schema.alterTable('sync_queue', (table) => {
      table.foreign('user_id').references('id').inTable('app_users').onDelete('CASCADE')
    })
  }

  async down() {}
}
