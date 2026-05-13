import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'dataset_permissions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('uuid_generate_v4()'))
      table.uuid('user_id').notNullable().references('id').inTable('app_users').onDelete('CASCADE')
      table.string('dataset_type', 100).notNullable().comment('imported_records | observations | predictions')
      table.uuid('dataset_id').nullable().comment('null = all records of this type')
      table
        .specificType('permissions', 'text[]')
        .notNullable()
        .defaultTo(this.raw("ARRAY['read']::text[]"))
        .comment('read | write | delete | export')
      table.uuid('granted_by').nullable().references('id').inTable('app_users').onDelete('SET NULL')
      table.timestamp('expires_at', { useTz: true }).nullable()
      table.timestamp('created_at', { useTz: true }).defaultTo(this.raw('NOW()'))
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.raw('NOW()'))

      table.index(['user_id', 'dataset_type'], 'idx_dataset_perms_user_type')
      table.index(['dataset_type', 'dataset_id'], 'idx_dataset_perms_resource')
    })

    this.defer(async (db) => {
      await db.rawQuery(`
        CREATE TRIGGER update_dataset_permissions_updated_at
        BEFORE UPDATE ON dataset_permissions
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
      `)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
