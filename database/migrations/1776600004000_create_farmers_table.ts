import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'farmers'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('uuid_generate_v4()'))
      table.uuid('organization_id').nullable().references('id').inTable('organizations').onDelete('SET NULL')
      table.string('full_name', 255).notNullable()
      table.string('phone', 20).nullable()
      table.string('location_region', 100).nullable().comment('e.g., Oromia, Amhara')
      table.string('location_zone', 100).nullable().comment('e.g., West Shewa')
      table.string('location_woreda', 100).nullable().comment('District')
      table.integer('household_size').nullable().checkPositive()
      table.text('notes').nullable()

      table.integer('created_by').notNullable().references('id').inTable('users').onDelete('RESTRICT')
      table.uuid('device_id').nullable().references('id').inTable('devices').onDelete('SET NULL')
      
      table.timestamp('client_created_at', { useTz: true }).nullable().comment('Device timestamp when created')
      table.timestamp('client_updated_at', { useTz: true }).nullable().comment('Device timestamp when last modified')
      table.timestamp('created_at', { useTz: true }).defaultTo(this.raw('NOW()'))
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.raw('NOW()'))
      table.timestamp('deleted_at', { useTz: true }).nullable().comment('Soft delete for sync conflicts')

      table.index(['organization_id'], 'idx_farmers_org')
      table.index(['created_by'], 'idx_farmers_created_by')
      table.index(['device_id'], 'idx_farmers_device')
    })
    
    this.defer(async (db) => {
      await db.rawQuery('CREATE INDEX idx_farmers_deleted ON farmers(deleted_at) WHERE deleted_at IS NULL')

      await db.rawQuery(`
        CREATE TRIGGER update_farmers_updated_at
        BEFORE UPDATE ON farmers
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
      `)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
