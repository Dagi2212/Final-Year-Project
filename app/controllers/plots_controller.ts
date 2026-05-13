import Plot from '#models/plot'
import { createPlotValidator, updatePlotValidator } from '#validators/plot'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class PlotsController {
  /**
   * GET /api/v1/plots
   * List plots with geo-bounding-box and farmer filters
   */
  async index({ request, response }: HttpContext) {
    const {
      farmerId,
      createdBy,
      soilType,
      irrigation,
      // bounding box params
      latMin,
      latMax,
      lngMin,
      lngMax,
      includeDeleted = 'false',
      page = 1,
      limit = 20,
    } = request.qs()

    const query = Plot.query()
      .preload('farmer')
      .preload('creator')
      .orderBy('created_at', 'desc')

    if (includeDeleted !== 'true') query.whereNull('deleted_at')
    if (farmerId) query.where('farmer_id', farmerId)
    if (createdBy) query.where('created_by', createdBy)
    if (soilType) query.where('soil_type', soilType)
    if (irrigation !== undefined) query.where('irrigation', irrigation === 'true')

    // Bounding box geo-filter
    if (latMin && latMax) query.whereBetween('latitude', [Number(latMin), Number(latMax)])
    if (lngMin && lngMax) query.whereBetween('longitude', [Number(lngMin), Number(lngMax)])

    const plots = await query.paginate(Number(page), Number(limit))
    return response.ok(plots)
  }

  /**
   * POST /api/v1/plots
   * Create a new farm plot
   */
  async store({ request, response }: HttpContext) {
    const data = await request.validateUsing(createPlotValidator)
    const plot = await Plot.create(data)
    return response.created(plot)
  }

  /**
   * GET /api/v1/plots/:id
   * Get plot with observations
   */
  async show({ params, response }: HttpContext) {
    const plot = await Plot.query()
      .where('id', params.id)
      .whereNull('deleted_at')
      .preload('farmer')
      .preload('creator')
      .preload('device')
      .preload('observations', (q) => q.whereNull('deleted_at').preload('cropType'))
      .firstOrFail()

    return response.ok(plot)
  }

  /**
   * PATCH /api/v1/plots/:id
   * Update plot data with optimistic locking via version
   */
  async update({ params, request, response }: HttpContext) {
    const plot = await Plot.query()
      .where('id', params.id)
      .whereNull('deleted_at')
      .firstOrFail()

    const data = await request.validateUsing(updatePlotValidator)

    // Optimistic lock: reject if client version is behind
    if (data.version !== undefined && data.version < plot.version) {
      return response.conflict({
        message: 'Version conflict: server has a newer version',
        serverVersion: plot.version,
      })
    }

    await plot.merge({ ...data, version: plot.version + 1 }).save()
    return response.ok(plot)
  }

  /**
   * DELETE /api/v1/plots/:id
   * Soft-delete a plot
   */
  async destroy({ params, response }: HttpContext) {
    const plot = await Plot.query()
      .where('id', params.id)
      .whereNull('deleted_at')
      .firstOrFail()

    plot.deletedAt = DateTime.now()
    await plot.save()
    return response.ok({ message: 'Plot soft-deleted', id: plot.id })
  }

  /**
   * POST /api/v1/plots/:id/restore
   * Restore a soft-deleted plot
   */
  async restore({ params, response }: HttpContext) {
    const plot = await Plot.query()
      .where('id', params.id)
      .whereNotNull('deleted_at')
      .firstOrFail()

    plot.deletedAt = null
    await plot.save()
    return response.ok({ message: 'Plot restored', id: plot.id })
  }

  /**
   * GET /api/v1/plots/nearby
   * Find plots within a radius (km) of a given lat/lng
   * Uses simple bounding-box approximation (PostGIS not required)
   */
  async nearby({ request, response }: HttpContext) {
    const { lat, lng, radiusKm = 5 } = request.qs()

    if (!lat || !lng) {
      return response.badRequest({ message: 'lat and lng are required' })
    }

    const latDelta = Number(radiusKm) / 111 // ~111 km per degree lat
    const lngDelta = Number(radiusKm) / (111 * Math.cos((Number(lat) * Math.PI) / 180))

    const plots = await Plot.query()
      .whereNull('deleted_at')
      .whereNotNull('latitude')
      .whereNotNull('longitude')
      .whereBetween('latitude', [Number(lat) - latDelta, Number(lat) + latDelta])
      .whereBetween('longitude', [Number(lng) - lngDelta, Number(lng) + lngDelta])
      .preload('farmer')
      .exec()

    return response.ok(plots)
  }
}
