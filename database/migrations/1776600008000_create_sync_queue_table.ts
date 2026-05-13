import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'sync_queue'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('uuid_generate_v4()'))
      table.uuid('device_id').notNullable().references('id').inTable('devices')
      table.integer('user_id').notNullable().references('id').inTable('users')
      table.string('batch_id', 255).notNullable()
      
      table.string('entity_type', 50).notNullable()
      table.uuid('entity_id').nullable()
      table.string('operation', 20).notNullable()
      
      table.jsonb('payload').notNullable()
      table.timestamp('client_timestamp', { useTz: true }).notNullable()
      
      table.string('status', 20).defaultTo('pending')
      table.integer('retry_count').defaultTo(0)
      table.text('error_message').nullable()
      table.timestamp('resolved_at', { useTz: true }).nullable()
      table.timestamp('server_timestamp', { useTz: true }).defaultTo(this.raw('NOW()'))
      
      table.timestamp('created_at', { useTz: true }).defaultTo(this.raw('NOW()'))
      table.timestamp('processed_at', { useTz: true }).nullable()

      table.index(['status'], 'idx_sync_queue_status')
      table.index(['device_id'], 'idx_sync_queue_device')
      table.index(['batch_id'], 'idx_sync_queue_batch')
      table.index(['entity_type', 'entity_id'], 'idx_sync_queue_entity')
    })

    this.defer(async (db) => {
      await db.rawQuery(`ALTER TABLE sync_queue ADD CONSTRAINT sync_queue_entity_type_check CHECK (entity_type IN ('farmer', 'plot', 'observation', 'attachment'))`)
      await db.rawQuery(`ALTER TABLE sync_queue ADD CONSTRAINT sync_queue_operation_check CHECK (operation IN ('CREATE', 'UPDATE', 'DELETE'))`)
      await db.rawQuery(`ALTER TABLE sync_queue ADD CONSTRAINT sync_queue_status_check CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'conflict'))`)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
