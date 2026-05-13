import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Extends the app_user_role_enum to include stakeholder roles needed
 * for the feature modification MVP (governance, dashboards, monetisation).
 */
export default class extends BaseSchema {
  async up() {
    this.defer(async (db) => {
      // PostgreSQL does not support removing enum values so we only ADD new ones
      for (const role of ['gov', 'ngo', 'trader', 'researcher']) {
        await db.rawQuery(
          `ALTER TYPE app_user_role_enum ADD VALUE IF NOT EXISTS '${role}'`
        )
      }
    })
  }

  async down() {
    // Enum value removal is not supported in Postgres; no-op on down
  }
}
