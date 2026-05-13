import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'devices'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('uuid_generate_v4()'))
      table.uuid('user_id').notNullable().references('id').inTable('app_users').onDelete('CASCADE')
      table.string('device_name', 100).nullable()
      table.string('device_uuid', 255).unique().notNullable().comment('Hardware/installation ID from browser/app')
      
      table.timestamp('last_sync_at', { useTz: true }).nullable()
      table.timestamp('created_at', { useTz: true }).defaultTo(this.raw('NOW()'))

      table.index(['user_id'], 'idx_devices_user')
      table.index(['device_uuid'], 'idx_devices_uuid')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
