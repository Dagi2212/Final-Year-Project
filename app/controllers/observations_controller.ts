import Observation from '#models/observation'
import { createObservationValidator, updateObservationValidator } from '#validators/observation'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class ObservationsController {
  /**
   * GET /api/v1/observations
   * List observations with filters for plot, crop, growth stage, health
   */
  async index({ request, response }: HttpContext) {
    const {
      plotId,
      cropTypeId,
      growthStage,
      healthStatus,
      createdBy,
      deviceId,
      fromDate,
      toDate,
      includeDeleted = 'false',
      page = 1,
      limit = 20,
    } = request.qs()

    const query = Observation.query()
      .preload('plot')
      .preload('cropType')
      .preload('creator')
      .orderBy('created_at', 'desc')

    if (includeDeleted !== 'true') query.whereNull('deleted_at')
    if (plotId) query.where('plot_id', plotId)
    if (cropTypeId) query.where('crop_type_id', cropTypeId)
    if (growthStage) query.where('growth_stage', growthStage)
    if (healthStatus) query.where('health_status', healthStatus)
    if (createdBy) query.where('created_by', createdBy)
    if (deviceId) query.where('device_id', deviceId)
    if (fromDate) query.where('planting_date', '>=', fromDate)
    if (toDate) query.where('planting_date', '<=', toDate)

    const observations = await query.paginate(Number(page), Number(limit))
    return response.ok(observations)
  }

  /**
   * POST /api/v1/observations
   * Record a new crop observation / yield survey
   */
  async store({ request, response }: HttpContext) {
    const data = await request.validateUsing(createObservationValidator)
    const observation = await Observation.create(data)
    await observation.load('cropType')
    return response.created(observation)
  }

  /**
   * GET /api/v1/observations/:id
   * Get a single observation with attachments
   */
  async show({ params, response }: HttpContext) {
    const observation = await Observation.query()
      .where('id', params.id)
      .whereNull('deleted_at')
      .preload('plot', (q) => q.preload('farmer'))
      .preload('cropType')
      .preload('creator')
      .preload('device')
      .preload('attachments')
      .firstOrFail()

    return response.ok(observation)
  }

  /**
   * PATCH /api/v1/observations/:id
   * Update an observation (incl. recording actual yield at harvest)
   */
  async update({ params, request, response }: HttpContext) {
    const observation = await Observation.query()
      .where('id', params.id)
      .whereNull('deleted_at')
      .firstOrFail()

    const data = await request.validateUsing(updateObservationValidator)

    if (data.version !== undefined && data.version < observation.version) {
      return response.conflict({
        message: 'Version conflict: server has a newer version',
        serverVersion: observation.version,
      })
    }

    await observation.merge({ ...data, version: observation.version + 1 }).save()
    return response.ok(observation)
  }

  /**
   * DELETE /api/v1/observations/:id
   * Soft-delete an observation
   */
  async destroy({ params, response }: HttpContext) {
    const observation = await Observation.query()
      .where('id', params.id)
      .whereNull('deleted_at')
      .firstOrFail()

    observation.deletedAt = DateTime.now()
    await observation.save()
    return response.ok({ message: 'Observation soft-deleted', id: observation.id })
  }

  /**
   * POST /api/v1/observations/:id/restore
   * Restore a soft-deleted observation
   */
  async restore({ params, response }: HttpContext) {
    const observation = await Observation.query()
      .where('id', params.id)
      .whereNotNull('deleted_at')
      .firstOrFail()

    observation.deletedAt = null
    await observation.save()
    return response.ok({ message: 'Observation restored', id: observation.id })
  }

  /**
   * PATCH /api/v1/observations/:id/harvest
   * Record actual yield at harvest time
   */
  async recordHarvest({ params, request, response }: HttpContext) {
    const observation = await Observation.query()
      .where('id', params.id)
      .whereNull('deleted_at')
      .firstOrFail()

    const { actualYieldKg, notes } = request.only(['actualYieldKg', 'notes'])
    observation.actualYieldKg = actualYieldKg
    observation.growthStage = 'harvest'
    if (notes) observation.notes = notes
    await observation.save()

    return response.ok(observation)
  }

  /**
   * GET /api/v1/observations/summary
   * Aggregated yield summary by crop type (mirrors dashboard_yield_summary view)
   */
  async summary({ response }: HttpContext) {
    const rows = await Observation.query()
      .whereNull('deleted_at')
      .where('planting_date', '>=', DateTime.now().startOf('year').toSQL()!)
      .select('crop_type_id')
      .count('* as observation_count')
      .avg('expected_yield_kg as avg_expected_yield_kg')
      .avg('actual_yield_kg as avg_actual_yield_kg')
      .min('planting_date as earliest_planting')
      .max('planting_date as latest_planting')
      .groupBy('crop_type_id')
      .preload('cropType')
      .exec()

    return response.ok(rows)
  }
}
