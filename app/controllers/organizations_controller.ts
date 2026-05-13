import Organization from '#models/organization'
import { createOrganizationValidator, updateOrganizationValidator } from '#validators/organization'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class OrganizationsController {
  /**
   * GET /api/v1/organizations
   * List all organizations with optional filters
   */
  async index({ request, response }: HttpContext) {
    const { type, region, page = 1, limit = 20 } = request.qs()

    const query = Organization.query().orderBy('created_at', 'desc')

    if (type) query.where('type', type)
    if (region) query.whereILike('region', `%${region}%`)

    const organizations = await query.paginate(Number(page), Number(limit))
    return response.ok(organizations)
  }

  /**
   * POST /api/v1/organizations
   * Create a new organization
   */
  async store({ request, response }: HttpContext) {
    const data = await request.validateUsing(createOrganizationValidator)
    const org = await Organization.create(data)
    return response.created(org)
  }

  /**
   * GET /api/v1/organizations/:id
   * Get a single organization with farmer count
   */
  async show({ params, response }: HttpContext) {
    const org = await Organization.query()
      .where('id', params.id)
      .preload('farmers', (q) => q.whereNull('deleted_at'))
      .firstOrFail()

    return response.ok(org)
  }

  /**
   * PATCH /api/v1/organizations/:id
   * Update an organization
   */
  async update({ params, request, response }: HttpContext) {
    const org = await Organization.findOrFail(params.id)
    const data = await request.validateUsing(updateOrganizationValidator)
    await org.merge(data).save()
    return response.ok(org)
  }

  /**
   * DELETE /api/v1/organizations/:id
   * Delete an organization
   */
  async destroy({ params, response }: HttpContext) {
    const org = await Organization.findOrFail(params.id)
    await org.delete()
    return response.noContent()
  }

  /**
   * GET /api/v1/organizations/:id/dashboard
   * Farmers stats + sync status for an organization
   */
  async dashboard({ params, response }: HttpContext) {
    const [farmerStats, syncStatus] = await Promise.all([
      db.from('dashboard_farmer_counts').where('organization_id', params.id).first(),
      db
        .from('dashboard_sync_status as ss')
        .join('devices as d', 'ss.device_id', 'd.id')
        .join('app_users as u', 'd.user_id', 'u.id')
        .where('u.organization_id', params.id)
        .select('ss.*'),
    ])

    if (!farmerStats && (!syncStatus || syncStatus.length === 0)) {
      return response.ok({ message: 'No data' })
    }

    return response.ok({
      ...farmerStats,
      syncStatus,
    })
  }
}
