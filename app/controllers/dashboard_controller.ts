import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import AppUser from '#models/app_user'
import { ROLES } from '#services/role_constants'

export default class DashboardController {
  /**
   * GET /api/v1/dashboard
   * Unified dashboard overview: farmer counts, yield summary, sync status.
   * Response is filtered based on the caller's role.
   */
  async index({ auth, response }: HttpContext) {
    const user = auth.user as any
    let role: string = user?.role ?? ''
    if (!role && user?.email) {
      const appUser = await AppUser.query().where('email', user.email).first()
      role = appUser?.role ?? 'researcher'
    }

    const [farmerCounts, yieldSummary, syncStatus, summary, recentLogs] = await Promise.all([
      db.from('dashboard_farmer_counts').select('*').orderBy('farmer_count', 'desc'),
      db.from('dashboard_yield_summary').select('*').orderBy('observation_count', 'desc'),
      db.from('dashboard_sync_status').select('*').orderBy('pending_count', 'desc'),
      this.getSummaryStats(),
      this.getRecentLogs(),
    ])

    // Base payload available to all authenticated users
    const payload: Record<string, unknown> = {
      summary,
      yieldSummary,
    }

    // Field-level data: restricted to internal staff + GOV/NGO/RESEARCHER
    const internalRoles: string[] = [
      ROLES.ADMIN,
      ROLES.SUPERVISOR,
      ROLES.FIELD_AGENT,
      ROLES.GOV,
      ROLES.NGO,
      ROLES.RESEARCHER,
    ]
    if (internalRoles.includes(role)) {
      payload.farmerCounts = farmerCounts
      payload.syncStatus = syncStatus
    }

    // Audit logs: admin / supervisor only
    if (role === ROLES.ADMIN || role === ROLES.SUPERVISOR) {
      payload.recentLogs = recentLogs
    }

    // Import & prediction stats: admin/supervisor/researcher/ngo
    const analyticsRoles: string[] = [ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.RESEARCHER, ROLES.NGO]
    if (analyticsRoles.includes(role)) {
      payload.importStats = await this.getImportStats()
      payload.predictionStats = await this.getPredictionStats()
    }

    return response.ok(payload)
  }

  /**
   * Internal helper to fetch top-level summary stats
   */
  private async getSummaryStats() {
    const [farmers, plots, yields, syncs] = await Promise.all([
      db.from('farmers').whereNull('deleted_at').count('* as total').first(),
      db.from('plots').whereNull('deleted_at').count('* as total').first(),
      db
        .from('observations')
        .whereNull('deleted_at')
        .select(
          db.raw('SUM(expected_yield_kg) as total_expected'),
          db.raw('SUM(actual_yield_kg) as total_actual')
        )
        .first(),
      db.from('sync_queue').where('status', 'pending').count('* as total').first(),
    ])

    return {
      totalFarmers: Number(farmers?.total || 0),
      totalPlots: Number(plots?.total || 0),
      totalExpectedYieldKg: Number(yields?.total_expected || 0),
      totalActualYieldKg: Number(yields?.total_actual || 0),
      pendingSyncs: Number(syncs?.total || 0),
    }
  }

  /**
   * Internal helper to fetch recent activity logs
   */
  private async getRecentLogs() {
    const logs = await db
      .from('audit_logs')
      .select('id', 'table_name', 'action', 'record_id', 'created_at', 'user_id')
      .orderBy('created_at', 'desc')
      .limit(10)

    // Enrich with user names if possible
    const userIds = logs.map((l) => l.user_id).filter(Boolean) as string[]
    const uuidIds = userIds.filter((id) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    )

    const appUsers =
      uuidIds.length > 0
        ? await db.from('app_users').whereIn('id', uuidIds).select('id', 'full_name')
        : []

    const userMap = new Map(appUsers.map((u) => [u.id, u.full_name]))

    return logs.map((log) => ({
      ...log,
      userName: userMap.get(log.user_id) || 'System',
    }))
  }

  /**
   * GET /api/v1/dashboard/farmer-counts
   * Active farmer count per organization (from view)
   */
  async farmerCounts({ response }: HttpContext) {
    const rows = await db
      .from('dashboard_farmer_counts')
      .select('*')
      .orderBy('farmer_count', 'desc')

    return response.ok(rows)
  }

  /**
   * GET /api/v1/dashboard/yield-summary
   * Yield estimates aggregated by crop type for the current season
   */
  async yieldSummary({ response }: HttpContext) {
    const rows = await db
      .from('dashboard_yield_summary')
      .select('*')
      .orderBy('observation_count', 'desc')

    return response.ok(rows)
  }

  /**
   * GET /api/v1/dashboard/sync-status
   * Pending / failed / conflict sync counts per device
   */
  async syncStatus({ response }: HttpContext) {
    const rows = await db
      .from('dashboard_sync_status')
      .select('*')
      .orderBy('pending_count', 'desc')

    return response.ok(rows)
  }

  /**
   * GET /api/v1/dashboard/health
   * API health check — checks DB connectivity
   */
  async health({ response }: HttpContext) {
    try {
      await db.rawQuery('SELECT 1')
      return response.ok({
        status: 'healthy',
        database: 'connected',
        timestamp: new Date().toISOString(),
      })
    } catch (err: any) {
      return response.serviceUnavailable({
        status: 'unhealthy',
        database: 'disconnected',
        error: err.message,
      })
    }
  }

  private async getImportStats() {
    const row = await db
      .from('import_jobs')
      .select(
        db.raw('COUNT(*) as total_jobs'),
        db.raw("COUNT(*) FILTER (WHERE status = 'completed') as completed_jobs"),
        db.raw("COUNT(*) FILTER (WHERE status = 'failed') as failed_jobs"),
        db.raw('SUM(imported_rows) as total_imported_rows')
      )
      .first()
    return {
      totalJobs: Number(row?.total_jobs || 0),
      completedJobs: Number(row?.completed_jobs || 0),
      failedJobs: Number(row?.failed_jobs || 0),
      totalImportedRows: Number(row?.total_imported_rows || 0),
    }
  }

  private async getPredictionStats() {
    const row = await db
      .from('predictions')
      .select(
        db.raw('COUNT(*) as total'),
        db.raw("COUNT(*) FILTER (WHERE status = 'completed') as completed"),
        db.raw('AVG(predicted_yield_kg) as avg_predicted_yield_kg')
      )
      .first()
    return {
      total: Number(row?.total || 0),
      completed: Number(row?.completed || 0),
      avgPredictedYieldKg: row?.avg_predicted_yield_kg
        ? Number(row.avg_predicted_yield_kg)
        : null,
    }
  }
}
