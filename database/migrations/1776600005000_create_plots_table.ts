import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'plots'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('uuid_generate_v4()'))
      table.uuid('farmer_id').notNullable().references('id').inTable('farmers').onDelete('CASCADE')
      table.string('plot_name', 100).nullable().comment('e.g., Field A, Home Plot')
      table.decimal('area_sqm', 10, 2).nullable().comment('Area in square meters')
      table.string('area_local', 50).nullable().comment('Local unit if provided, e.g. timad')

      table.decimal('latitude', 10, 8).nullable().checkBetween([-90, 90])
      table.decimal('longitude', 11, 8).nullable().checkBetween([-180, 180])
      table.decimal('altitude', 8, 2).nullable()

      table.string('soil_type', 50).nullable().comment('e.g., clay, loam, sandy')
      table.boolean('irrigation').defaultTo(false)

      table.integer('created_by').notNullable().references('id').inTable('users').onDelete('RESTRICT')
      table.uuid('device_id').nullable().references('id').inTable('devices').onDelete('SET NULL')
      table.timestamp('client_created_at', { useTz: true }).nullable()
      table.timestamp('client_updated_at', { useTz: true }).nullable()
      table.integer('version').defaultTo(1).comment('Optimistic locking version')

      table.timestamp('created_at', { useTz: true }).defaultTo(this.raw('NOW()'))
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.raw('NOW()'))
      table.timestamp('deleted_at', { useTz: true }).nullable()

      table.index(['farmer_id'], 'idx_plots_farmer')
      table.index(['latitude', 'longitude'], 'idx_plots_location')
      table.index(['device_id'], 'idx_plots_device')
    })
    
    this.defer(async (db) => {
      await db.rawQuery('CREATE INDEX idx_plots_deleted ON plots(deleted_at) WHERE deleted_at IS NULL')

      await db.rawQuery(`
        CREATE TRIGGER update_plots_updated_at
        BEFORE UPDATE ON plots
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
      `)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
