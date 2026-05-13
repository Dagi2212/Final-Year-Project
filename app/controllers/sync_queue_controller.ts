import SyncQueue from '#models/sync_queue'
import { createSyncQueueValidator, updateSyncQueueStatusValidator } from '#validators/sync_queue'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class SyncQueueController {
  /**
   * GET /api/v1/sync-queue
   * List sync items with status/device/entity filters
   */
  async index({ request, response }: HttpContext) {
    const {
      deviceId,
      userId,
      batchId,
      entityType,
      status,
      page = 1,
      limit = 50,
    } = request.qs()

    const query = SyncQueue.query()
      .preload('device')
      .preload('user')
      .orderBy('client_timestamp', 'asc')

    if (deviceId) query.where('device_id', deviceId)
    if (userId) query.where('user_id', userId)
    if (batchId) query.where('batch_id', batchId)
    if (entityType) query.where('entity_type', entityType)
    if (status) query.where('status', status)

    const items = await query.paginate(Number(page), Number(limit))
    return response.ok(items)
  }

  /**
   * POST /api/v1/sync-queue
   * Enqueue a single sync operation from a device
   */
  async store({ request, response }: HttpContext) {
    const data = await request.validateUsing(createSyncQueueValidator)
    const item = await SyncQueue.create({ ...data, status: 'pending', retryCount: 0 })
    return response.created(item)
  }

  /**
   * POST /api/v1/sync-queue/batch
   * Enqueue a batch of sync operations in one request (bulk push)
   */
  async batch({ request, response }: HttpContext) {
    const { items } = request.only(['items']) as { items: unknown[] }

    if (!Array.isArray(items) || items.length === 0) {
      return response.badRequest({ message: '`items` array is required and must not be empty' })
    }

    const created: SyncQueue[] = []
    const errors: { index: number; error: string }[] = []

    for (let i = 0; i < items.length; i++) {
      try {
        const data = await createSyncQueueValidator.validate(items[i])
        const item = await SyncQueue.create({ ...data, status: 'pending', retryCount: 0 })
        created.push(item)
      } catch (err: any) {
        errors.push({ index: i, error: err.message ?? String(err) })
      }
    }

    return response.ok({
      accepted: created.length,
      rejected: errors.length,
      errors,
      items: created,
    })
  }

  /**
   * GET /api/v1/sync-queue/:id
   * Get a specific sync item
   */
  async show({ params, response }: HttpContext) {
    const item = await SyncQueue.query()
      .where('id', params.id)
      .preload('device')
      .preload('user')
      .firstOrFail()

    return response.ok(item)
  }

  /**
   * PATCH /api/v1/sync-queue/:id/status
   * Update processing status (processing → completed / failed / conflict)
   */
  async updateStatus({ params, request, response }: HttpContext) {
    const item = await SyncQueue.findOrFail(params.id)
    const data = await request.validateUsing(updateSyncQueueStatusValidator)

    item.status = data.status
    if (data.errorMessage) item.errorMessage = data.errorMessage
    if (data.entityId) item.entityId = data.entityId
    if (data.resolvedAt) item.resolvedAt = DateTime.fromJSDate(data.resolvedAt as unknown as Date)
    if (data.status === 'completed' || data.status === 'failed') {
      item.processedAt = DateTime.now()
    }

    await item.save()
    return response.ok(item)
  }

  /**
   * POST /api/v1/sync-queue/:id/retry
   * Increment retry count and reset status to pending
   */
  async retry({ params, response }: HttpContext) {
    const item = await SyncQueue.findOrFail(params.id)

    if (item.retryCount >= 5) {
      return response.badRequest({ message: 'Max retry attempts (5) reached' })
    }

    item.retryCount = item.retryCount + 1
    item.status = 'pending'
    item.errorMessage = null
    await item.save()

    return response.ok({ message: 'Queued for retry', retryCount: item.retryCount })
  }

  /**
   * DELETE /api/v1/sync-queue/:id
   * Remove a completed or failed sync item
   */
  async destroy({ params, response }: HttpContext) {
    const item = await SyncQueue.findOrFail(params.id)
    await item.delete()
    return response.noContent()
  }

  /**
   * GET /api/v1/sync-queue/stats
   * Counts by status for monitoring dashboard
   */
  async stats({ request, response }: HttpContext) {
    const { deviceId } = request.qs()

    const query = SyncQueue.query()
      .select('status')
      .count('* as count')
      .groupBy('status')

    if (deviceId) query.where('device_id', deviceId)

    const rows = await query.exec()
    return response.ok(rows)
  }
}
