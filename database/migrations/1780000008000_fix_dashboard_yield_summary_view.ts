import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
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
      GROUP BY ct.id, ct.name, ct.local_name
    `)
  }

  async down() {
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
  }
}
