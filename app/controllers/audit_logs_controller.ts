import AuditLog from '#models/audit_log'
import type { HttpContext } from '@adonisjs/core/http'

export default class AuditLogsController {
  /**
   * GET /api/v1/audit-logs
   * List audit entries with rich filters
   */
  async index({ request, response }: HttpContext) {
    const {
      userId,
      tableName,
      recordId,
      action,
      fromDate,
      toDate,
      page = 1,
      limit = 50,
    } = request.qs()

    const query = AuditLog.query()
      .orderBy('created_at', 'desc')

    if (userId) query.where('user_id', userId)
    if (tableName) query.where('table_name', tableName)
    if (recordId) query.where('record_id', recordId)
    if (action) query.where('action', action)
    if (fromDate) query.where('created_at', '>=', fromDate)
    if (toDate) query.where('created_at', '<=', toDate)

    const logs = await query.paginate(Number(page), Number(limit))

    // Manually enrich with user data to handle both UUID (AppUser) and Integer (User) IDs
    const userIds = logs.map(log => log.userId).filter(Boolean) as string[]
    const uuidIds = userIds.filter(id => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))
    const integerIds = userIds.filter(id => /^\d+$/.test(id)).map(id => Number(id))

    const appUsers = uuidIds.length > 0 
      ? await (await import('#models/app_user')).default.query().whereIn('id', uuidIds)
      : []
    
    const systemUsers = integerIds.length > 0
      ? await (await import('#models/user')).default.query().whereIn('id', integerIds)
      : []

    const userMap = new Map<string, any>()
    appUsers.forEach(u => userMap.set(u.id, u))
    systemUsers.forEach(u => userMap.set(String(u.id), u))

    const enrichedLogs = logs.serialize()
    enrichedLogs.data = enrichedLogs.data.map((log: any) => {
      log.user = userMap.get(log.userId) || null
      return log
    })

    return response.ok(enrichedLogs)
  }

  /**
   * POST /api/v1/audit-logs
   * Manually write an audit entry (e.g. from sync processor)
   */
  async store({ request, response }: HttpContext) {
    const data = request.only([
      'userId',
      'tableName',
      'recordId',
      'action',
      'oldValues',
      'newValues',
      'ipAddress',
      'userAgent',
    ])

    const log = await AuditLog.create(data)
    return response.created(log)
  }

  /**
   * GET /api/v1/audit-logs/:id
   * Get a single audit log entry
   */
  async show({ params, response }: HttpContext) {
    const log = await AuditLog.findOrFail(params.id)
    const logData = log.serialize()
    
    if (log.userId) {
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(log.userId)) {
        logData.user = await (await import('#models/app_user')).default.find(log.userId)
      } else if (/^\d+$/.test(log.userId)) {
        logData.user = await (await import('#models/user')).default.find(Number(log.userId))
      }
    }

    return response.ok(logData)
  }

  /**
   * GET /api/v1/audit-logs/record/:tableName/:recordId
   * Get full audit trail for a specific record across all actions
   */
  async byRecord({ params, response }: HttpContext) {
    const logs = await AuditLog.query()
      .where('table_name', params.tableName)
      .where('record_id', params.recordId)
      .orderBy('created_at', 'asc')
      .exec()

    const userIds = logs.map(log => log.userId).filter(Boolean) as string[]
    const uuidIds = userIds.filter(id => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))
    const integerIds = userIds.filter(id => /^\d+$/.test(id)).map(id => Number(id))

    const appUsers = uuidIds.length > 0 
      ? await (await import('#models/app_user')).default.query().whereIn('id', uuidIds)
      : []
    
    const systemUsers = integerIds.length > 0
      ? await (await import('#models/user')).default.query().whereIn('id', integerIds)
      : []

    const userMap = new Map<string, any>()
    appUsers.forEach(u => userMap.set(u.id, u))
    systemUsers.forEach(u => userMap.set(String(u.id), u))

    const enrichedLogs = logs.map(log => {
      const logData = log.serialize()
      logData.user = userMap.get(log.userId!) || null
      return logData
    })

    return response.ok(enrichedLogs)
  }

  /**
   * GET /api/v1/audit-logs/stats
   * Count of audit entries grouped by action type and table
   */
  async stats({ response }: HttpContext) {
    const rows = await AuditLog.query()
      .select('table_name', 'action')
      .count('* as count')
      .groupBy('table_name', 'action')
      .orderBy('table_name', 'asc')
      .exec()

    return response.ok(rows)
  }
}
