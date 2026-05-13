import AppUser from '#models/app_user'
import { createAppUserValidator, updateAppUserValidator } from '#validators/app_user'
import type { HttpContext } from '@adonisjs/core/http'

export default class AppUsersController {
  /**
   * GET /api/v1/app-users
   * List users with optional role/org filters
   */
  async index({ request, response }: HttpContext) {
    const { organizationId, role, isActive, page = 1, limit = 20 } = request.qs()

    const query = AppUser.query().orderBy('created_at', 'desc')

    if (organizationId) query.where('organization_id', organizationId)
    if (role) query.where('role', role)
    if (isActive !== undefined) query.where('is_active', isActive === 'true')

    const users = await query.paginate(Number(page), Number(limit))
    return response.ok(users)
  }

  /**
   * POST /api/v1/app-users
   * Create a new user (field agent / admin)
   */
  async store({ request, response }: HttpContext) {
    const data = await request.validateUsing(createAppUserValidator)
    const user = await AppUser.create(data)
    return response.created(user)
  }

  /**
   * GET /api/v1/app-users/:id
   * Get a user with their devices
   */
  async show({ params, response }: HttpContext) {
    const user = await AppUser.query()
      .where('id', params.id)
      .preload('devices')
      .preload('organization')
      .firstOrFail()

    return response.ok(user)
  }

  /**
   * PATCH /api/v1/app-users/:id
   * Update a user record
   */
  async update({ params, request, response }: HttpContext) {
    const user = await AppUser.findOrFail(params.id)
    const data = await request.validateUsing(updateAppUserValidator)
    await user.merge(data).save()
    return response.ok(user)
  }

  /**
   * DELETE /api/v1/app-users/:id
   * Soft-deactivate or hard-delete a user
   */
  async destroy({ params, request, response }: HttpContext) {
    const user = await AppUser.findOrFail(params.id)
    const { hard = false } = request.qs()

    if (hard === 'true') {
      await user.delete()
      return response.noContent()
    }

    // Soft deactivate
    user.isActive = false
    await user.save()
    return response.ok({ message: 'User deactivated' })
  }

  /**
   * PATCH /api/v1/app-users/:id/activate
   * Re-activate a deactivated user
   */
  async activate({ params, response }: HttpContext) {
    const user = await AppUser.findOrFail(params.id)
    user.isActive = true
    await user.save()
    return response.ok({ message: 'User activated' })
  }

  /**
   * GET /api/v1/app-users/:id/devices
   * List devices registered to this user
   */
  async devices({ params, response }: HttpContext) {
    const user = await AppUser.query().where('id', params.id).preload('devices').firstOrFail()
    return response.ok(user.devices)
  }
}
