import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'observations'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('uuid_generate_v4()'))
      table.uuid('plot_id').notNullable().references('id').inTable('plots').onDelete('CASCADE')
      table.uuid('crop_type_id').notNullable().references('id').inTable('crop_types').onDelete('RESTRICT')
      
      table.date('planting_date').nullable()
      table.decimal('expected_yield_kg', 10, 2).nullable()
      table.decimal('actual_yield_kg', 10, 2).nullable()
      table.date('yield_estimate_date').nullable()
      table.string('growth_stage', 50).nullable()
      table.string('health_status', 50).nullable()
      table.text('pest_issues').nullable()
      table.boolean('fertilizer_used').defaultTo(false)
      table.text('notes').nullable()
      table.jsonb('metadata').defaultTo('{}')
      
      table.integer('created_by').notNullable().references('id').inTable('users').onDelete('RESTRICT')
      table.uuid('device_id').nullable().references('id').inTable('devices').onDelete('SET NULL')
      table.timestamp('client_created_at', { useTz: true }).nullable()
      table.timestamp('client_updated_at', { useTz: true }).nullable()
      table.integer('version').defaultTo(1)
      
      table.timestamp('created_at', { useTz: true }).defaultTo(this.raw('NOW()'))
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.raw('NOW()'))
      table.timestamp('deleted_at', { useTz: true }).nullable()

      table.index(['plot_id'], 'idx_observations_plot')
      table.index(['crop_type_id'], 'idx_observations_crop')
      table.index(['created_by'], 'idx_observations_created_by')
      table.index(['device_id'], 'idx_observations_device')
      table.index(['yield_estimate_date'], 'idx_observations_estimate_date')
    })
    
    this.defer(async (db) => {
      await db.rawQuery('CREATE INDEX idx_observations_deleted ON observations(deleted_at) WHERE deleted_at IS NULL')

      await db.rawQuery(`
        CREATE TRIGGER update_observations_updated_at
        BEFORE UPDATE ON observations
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
      `)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
