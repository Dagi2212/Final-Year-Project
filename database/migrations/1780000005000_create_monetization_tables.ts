import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    // Products
    this.schema.createTable('products', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('uuid_generate_v4()'))
      table.string('name', 255).notNullable()
      table.text('description').nullable()
      table
        .enu('product_type', ['dataset_export', 'analytics_report', 'subscription', 'pay_per_query'], {
          useNative: true,
          enumName: 'product_type_enum',
          existingType: false,
        })
        .notNullable()
      table.decimal('price_usd', 10, 2).notNullable().defaultTo(0)
      table.boolean('is_active').defaultTo(true)
      table.jsonb('metadata').nullable()
      table.timestamp('created_at', { useTz: true }).defaultTo(this.raw('NOW()'))
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.raw('NOW()'))
    })

    // Subscriptions
    this.schema.createTable('subscriptions', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('uuid_generate_v4()'))
      table.uuid('user_id').notNullable().references('id').inTable('app_users').onDelete('CASCADE')
      table.uuid('product_id').notNullable().references('id').inTable('products').onDelete('RESTRICT')
      table
        .enu('status', ['active', 'expired', 'cancelled', 'pending'], {
          useNative: true,
          enumName: 'subscription_status_enum',
          existingType: false,
        })
        .notNullable()
        .defaultTo('pending')
      table.timestamp('starts_at', { useTz: true }).nullable()
      table.timestamp('expires_at', { useTz: true }).nullable()
      table.timestamp('created_at', { useTz: true }).defaultTo(this.raw('NOW()'))
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.raw('NOW()'))

      table.index(['user_id', 'status'], 'idx_subscriptions_user_status')
    })

    // Transactions
    this.schema.createTable('transactions', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('uuid_generate_v4()'))
      table.uuid('user_id').notNullable().references('id').inTable('app_users').onDelete('RESTRICT')
      table.uuid('product_id').nullable().references('id').inTable('products').onDelete('SET NULL')
      table.uuid('subscription_id').nullable().references('id').inTable('subscriptions').onDelete('SET NULL')
      table.decimal('amount_usd', 10, 2).notNullable()
      table.string('currency', 10).notNullable().defaultTo('USD')
      table
        .enu('status', ['pending', 'completed', 'failed', 'refunded'], {
          useNative: true,
          enumName: 'transaction_status_enum',
          existingType: false,
        })
        .notNullable()
        .defaultTo('pending')
      table.string('payment_provider', 100).nullable().comment('stripe | paystack | etc')
      table.string('payment_reference', 255).nullable()
      table.jsonb('payment_metadata').nullable()
      table.timestamp('created_at', { useTz: true }).defaultTo(this.raw('NOW()'))
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.raw('NOW()'))

      table.index(['user_id', 'status'], 'idx_transactions_user_status')
    })

    this.defer(async (db) => {
      for (const t of ['products', 'subscriptions', 'transactions']) {
        await db.rawQuery(`
          CREATE TRIGGER update_${t}_updated_at
          BEFORE UPDATE ON ${t}
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
        `)
      }
    })
  }

  async down() {
    this.schema.dropTable('transactions')
    this.schema.dropTable('subscriptions')
    this.schema.dropTable('products')
    this.defer(async (db) => {
      await db.rawQuery('DROP TYPE IF EXISTS transaction_status_enum CASCADE')
      await db.rawQuery('DROP TYPE IF EXISTS subscription_status_enum CASCADE')
      await db.rawQuery('DROP TYPE IF EXISTS product_type_enum CASCADE')
    })
  }
}
