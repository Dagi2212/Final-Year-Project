import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'app_users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('uuid_generate_v4()'))
      table.uuid('organization_id').nullable().references('id').inTable('organizations').onDelete('SET NULL')
      table.string('email', 255).unique().nullable()
      table.string('password_hash', 255).nullable().comment('bcrypt hash')
      table.string('full_name', 255).notNullable()
      table.string('phone', 20).unique().nullable()
      table
        .enu('role', ['admin', 'field_agent', 'supervisor'], {
          useNative: true,
          enumName: 'app_user_role_enum',
          existingType: false,
        })
        .nullable()
      table.boolean('is_active').defaultTo(true)
      
      table.timestamp('created_at', { useTz: true }).defaultTo(this.raw('NOW()'))
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.raw('NOW()'))

      table.index(['organization_id'], 'idx_app_users_org')
      table.index(['role'], 'idx_app_users_role')
    })

    this.defer(async (db) => {
      await db.rawQuery(`
        CREATE TRIGGER update_app_users_updated_at
        BEFORE UPDATE ON app_users
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
      `)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
    this.defer(async (db) => {
      await db.rawQuery('DROP TYPE IF EXISTS app_user_role_enum CASCADE')
    })
  }
}
