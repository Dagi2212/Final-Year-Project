import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'attachments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('uuid_generate_v4()'))
      table.uuid('observation_id').nullable().references('id').inTable('observations').onDelete('CASCADE')
      table.text('file_url').notNullable()
      table.string('file_type', 50).nullable()
      table.integer('file_size_bytes').nullable()
      table.string('caption', 255).nullable()
      
      table.integer('uploaded_by').notNullable().references('id').inTable('users').onDelete('RESTRICT')
      table.uuid('device_id').nullable().references('id').inTable('devices').onDelete('SET NULL')
      table.timestamp('client_created_at', { useTz: true }).nullable()
      
      table.timestamp('created_at', { useTz: true }).defaultTo(this.raw('NOW()'))

      table.index(['observation_id'], 'idx_attachments_observation')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
