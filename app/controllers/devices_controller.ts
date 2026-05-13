import Device from '#models/device'
import { createDeviceValidator, updateDeviceValidator } from '#validators/device'
import type { HttpContext } from '@adonisjs/core/http'

export default class DevicesController {
  /**
   * GET /api/v1/devices
   * List all devices with optional userId filter
   */
  async index({ request, response }: HttpContext) {
    const { userId, page = 1, limit = 20 } = request.qs()

    const query = Device.query().preload('user').orderBy('created_at', 'desc')

    if (userId) query.where('user_id', userId)

    const devices = await query.paginate(Number(page), Number(limit))
    return response.ok(devices)
  }

  /**
   * POST /api/v1/devices
   * Register a new device
   */
  async store({ request, response }: HttpContext) {
    const data = await request.validateUsing(createDeviceValidator)
    const device = await Device.create(data)
    return response.created(device)
  }

  /**
   * GET /api/v1/devices/:id
   * Get a single device by UUID primary key
   */
  async show({ params, response }: HttpContext) {
    const device = await Device.query()
      .where('id', params.id)
      .preload('user')
      .firstOrFail()

    return response.ok(device)
  }

  /**
   * GET /api/v1/devices/by-uuid/:deviceUuid
   * Lookup a device by its hardware UUID
   */
  async showByUuid({ params, response }: HttpContext) {
    const device = await Device.query()
      .where('device_uuid', params.deviceUuid)
      .preload('user')
      .firstOrFail()

    return response.ok(device)
  }

  /**
   * PATCH /api/v1/devices/:id
   * Update device name or last sync timestamp
   */
  async update({ params, request, response }: HttpContext) {
    const device = await Device.findOrFail(params.id)
    const data = await request.validateUsing(updateDeviceValidator)
    await device.merge(data).save()
    return response.ok(device)
  }

  /**
   * PATCH /api/v1/devices/:id/sync
   * Stamp the device's last_sync_at to now
   */
  async markSynced({ params, response }: HttpContext) {
    const device = await Device.findOrFail(params.id)
    device.lastSyncAt = (await import('luxon')).DateTime.now()
    await device.save()
    return response.ok({ message: 'Sync timestamp updated', lastSyncAt: device.lastSyncAt })
  }

  /**
   * DELETE /api/v1/devices/:id
   * Delete a device registration
   */
  async destroy({ params, response }: HttpContext) {
    const device = await Device.findOrFail(params.id)
    await device.delete()
    return response.noContent()
  }
}
