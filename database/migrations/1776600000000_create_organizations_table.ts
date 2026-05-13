import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'organizations'

  async up() {
    await this.db.rawQuery('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')

    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('uuid_generate_v4()'))
      table.string('name', 255).notNullable()
      table
        .enu('type', ['cooperative', 'ngo', 'government', 'private'], {
          useNative: true,
          enumName: 'organization_type_enum',
          existingType: false,
        })
        .nullable()
      table.string('region', 100).nullable()
      table.string('contact_phone', 20).nullable()
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())

      table.comment('Stakeholder organizations (cooperatives, NGOs, government agencies)')
    })

    this.defer(async (db) => {
      await db.rawQuery(`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ language 'plpgsql'
      `)

      await db.rawQuery(`
        CREATE TRIGGER update_organizations_updated_at
        BEFORE UPDATE ON organizations
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
      `)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
    this.defer(async (db) => {
      await db.rawQuery('DROP TYPE IF EXISTS organization_type_enum CASCADE')
    })
  }
}
