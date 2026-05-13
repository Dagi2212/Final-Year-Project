import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Extends the audit_logs action check constraint to cover new action types
 * introduced by the feature modification MVP (IMPORT, PREDICT, QUERY, EXPORT, PAYMENT).
 */
export default class extends BaseSchema {
  async up() {
    this.defer(async (db) => {
      await db.rawQuery(`ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_action_check`)
      await db.rawQuery(`
        ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_action_check
        CHECK (action IN ('INSERT','UPDATE','DELETE','SYNC','IMPORT','PREDICT','QUERY','EXPORT','PAYMENT'))
      `)
    })
  }

  async down() {
    this.defer(async (db) => {
      await db.rawQuery(`ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_action_check`)
      await db.rawQuery(`
        ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_action_check
        CHECK (action IN ('INSERT','UPDATE','DELETE','SYNC'))
      `)
    })
  }
}
