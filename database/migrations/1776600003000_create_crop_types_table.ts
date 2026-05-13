import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'crop_types'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('uuid_generate_v4()'))
      table.string('name', 100).notNullable()
      table.string('local_name', 100).nullable().comment('Local language name if applicable')
      table.string('category', 50).nullable().comment('e.g., cereal, pulse, vegetable')
      table.text('description').nullable()
      table.timestamp('created_at', { useTz: true }).defaultTo(this.raw('NOW()'))
    })

    this.defer(async (db) => {
      await db.rawQuery(`
        INSERT INTO crop_types (id, name, local_name, category, description) VALUES
        (uuid_generate_v4(), 'Teff',    'ጤፍ',  'cereal', 'Ethiopian native cereal, staple grain'),
        (uuid_generate_v4(), 'Wheat',   'ስንዴ', 'cereal', 'Domesticated cereal grain'),
        (uuid_generate_v4(), 'Maize',   'በቆሎ', 'cereal', 'Widely cultivated staple'),
        (uuid_generate_v4(), 'Sorghum', 'ማሽላ', 'cereal', 'Drought-resistant grain'),
        (uuid_generate_v4(), 'Barley',  'ገብስ', 'cereal', 'Highland cereal crop')
      `)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
