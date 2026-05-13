import Farmer from '#models/farmer'
import { createFarmerValidator, updateFarmerValidator } from '#validators/farmer'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class FarmersController {
  /**
   * GET /api/v1/farmers
   * List active farmers with rich filters and pagination
   */
  async index({ request, response }: HttpContext) {
    const {
      organizationId,
      region,
      zone,
      woreda,
      createdBy,
      deviceId,
      search,
      includeDeleted = 'false',
      page = 1,
      limit = 20,
    } = request.qs()

    const query = Farmer.query()
      .preload('organization')
      .preload('creator')
      .orderBy('created_at', 'desc')

    if (includeDeleted !== 'true') query.whereNull('deleted_at')
    if (organizationId) query.where('organization_id', organizationId)
    if (region) query.whereILike('location_region', `%${region}%`)
    if (zone) query.whereILike('location_zone', `%${zone}%`)
    if (woreda) query.whereILike('location_woreda', `%${woreda}%`)
    if (createdBy) query.where('created_by', createdBy)
    if (deviceId) query.where('device_id', deviceId)
    if (search) query.whereILike('full_name', `%${search}%`)

    const farmers = await query.paginate(Number(page), Number(limit))
    return response.ok(farmers)
  }

  /**
   * POST /api/v1/farmers
   * Register a new farmer record
   */
  async store({ request, response }: HttpContext) {
    const data = await request.validateUsing(createFarmerValidator)
    const farmer = await Farmer.create(data)
    return response.created(farmer)
  }

  /**
   * GET /api/v1/farmers/:id
   * Get farmer with plots and organization details
   */
  async show({ params, response }: HttpContext) {
    const farmer = await Farmer.query()
      .where('id', params.id)
      .whereNull('deleted_at')
      .preload('organization')
      .preload('creator')
      .preload('device')
      .preload('plots', (q) => q.whereNull('deleted_at'))
      .firstOrFail()

    return response.ok(farmer)
  }

  /**
   * PATCH /api/v1/farmers/:id
   * Update farmer data (with optimistic conflict detection via client_updated_at)
   */
  async update({ params, request, response }: HttpContext) {
    const farmer = await Farmer.query()
      .where('id', params.id)
      .whereNull('deleted_at')
      .firstOrFail()

    const data = await request.validateUsing(updateFarmerValidator)
    await farmer.merge(data).save()
    return response.ok(farmer)
  }

  /**
   * DELETE /api/v1/farmers/:id
   * Soft-delete a farmer (sets deleted_at)
   */
  async destroy({ params, response }: HttpContext) {
    const farmer = await Farmer.query()
      .where('id', params.id)
      .whereNull('deleted_at')
      .firstOrFail()

    farmer.deletedAt = DateTime.now()
    await farmer.save()
    return response.ok({ message: 'Farmer soft-deleted', id: farmer.id })
  }

  /**
   * POST /api/v1/farmers/:id/restore
   * Restore a soft-deleted farmer
   */
  async restore({ params, response }: HttpContext) {
    const farmer = await Farmer.query()
      .where('id', params.id)
      .whereNotNull('deleted_at')
      .firstOrFail()

    farmer.deletedAt = null
    await farmer.save()
    return response.ok({ message: 'Farmer restored', id: farmer.id })
  }

  /**
   * GET /api/v1/farmers/:id/plots
   * Get all active plots for a farmer
   */
  async plots({ params, response }: HttpContext) {
    const farmer = await Farmer.query()
      .where('id', params.id)
      .whereNull('deleted_at')
      .preload('plots', (q) => q.whereNull('deleted_at').preload('observations'))
      .firstOrFail()

    return response.ok(farmer.plots)
  }

  /**
   * GET /api/v1/farmers/stats
   * Counts by region/organization for dashboard
   */
  async stats({ request, response }: HttpContext) {
    const { organizationId } = request.qs()

    const query = Farmer.query()
      .whereNull('deleted_at')
      .select('location_region')
      .count('* as total')
      .groupBy('location_region')
      .orderBy('total', 'desc')

    if (organizationId) query.where('organization_id', organizationId)

    const rows = await query.exec()
    return response.ok(rows)
  }
}
