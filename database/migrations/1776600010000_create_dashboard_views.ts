import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    await this.db.rawQuery(`
      CREATE OR REPLACE VIEW dashboard_farmer_counts AS
      SELECT 
          o.id as organization_id,
          o.name as organization_name,
          COUNT(f.id) as farmer_count,
          COUNT(f.id) FILTER (WHERE f.created_at >= NOW() - INTERVAL '30 days') as new_farmers_30d
      FROM organizations o
      LEFT JOIN farmers f ON o.id = f.organization_id AND f.deleted_at IS NULL
      GROUP BY o.id, o.name
    `)

    await this.db.rawQuery(`
      CREATE OR REPLACE VIEW dashboard_yield_summary AS
      SELECT 
          ct.name as crop_name,
          ct.local_name,
          ct.id as crop_type_id,
          COUNT(o.id) as observation_count,
          ROUND(AVG(o.expected_yield_kg), 2) as avg_expected_yield_kg,
          ROUND(AVG(o.actual_yield_kg), 2) as avg_actual_yield_kg,
          MIN(o.planting_date) as earliest_planting,
          MAX(o.planting_date) as latest_planting
      FROM observations o
      JOIN crop_types ct ON o.crop_type_id = ct.id
      WHERE o.deleted_at IS NULL
        AND o.planting_date >= DATE_TRUNC('year', NOW())
      GROUP BY ct.id, ct.name, ct.local_name
    `)

    await this.db.rawQuery(`
      CREATE OR REPLACE VIEW dashboard_sync_status AS
      SELECT 
          d.id as device_id,
          d.device_uuid,
          u.full_name as agent_name,
          COUNT(*) FILTER (WHERE sq.status = 'pending') as pending_count,
          COUNT(*) FILTER (WHERE sq.status = 'failed') as failed_count,
          COUNT(*) FILTER (WHERE sq.status = 'conflict') as conflict_count,
          MAX(d.last_sync_at) as last_sync
      FROM devices d
      JOIN app_users u ON d.user_id = u.id
      LEFT JOIN sync_queue sq ON d.id = sq.device_id
      GROUP BY d.id, d.device_uuid, u.full_name
    `)
  }

  async down() {
    await this.db.rawQuery('DROP VIEW IF EXISTS dashboard_farmer_counts')
    await this.db.rawQuery('DROP VIEW IF EXISTS dashboard_yield_summary')
    await this.db.rawQuery('DROP VIEW IF EXISTS dashboard_sync_status')
  }
}
