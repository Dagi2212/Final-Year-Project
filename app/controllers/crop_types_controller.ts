import CropType from '#models/crop_type'
import { createCropTypeValidator, updateCropTypeValidator } from '#validators/crop_type'
import type { HttpContext } from '@adonisjs/core/http'

export default class CropTypesController {
  /**
   * GET /api/v1/crop-types
   * List all crop types with optional category filter
   */
  async index({ request, response }: HttpContext) {
    const { category, search } = request.qs()

    const query = CropType.query().orderBy('name', 'asc')

    if (category) query.where('category', category)
    if (search) {
      query.where((q) => {
        q.whereILike('name', `%${search}%`).orWhereILike('local_name', `%${search}%`)
      })
    }

    const crops = await query.exec()
    return response.ok(crops)
  }

  /**
   * POST /api/v1/crop-types
   * Add a new crop type to the catalog
   */
  async store({ request, response }: HttpContext) {
    const data = await request.validateUsing(createCropTypeValidator)
    const crop = await CropType.create(data)
    return response.created(crop)
  }

  /**
   * GET /api/v1/crop-types/:id
   * Get a single crop type
   */
  async show({ params, response }: HttpContext) {
    const crop = await CropType.findOrFail(params.id)
    return response.ok(crop)
  }

  /**
   * PATCH /api/v1/crop-types/:id
   * Update a crop type entry
   */
  async update({ params, request, response }: HttpContext) {
    const crop = await CropType.findOrFail(params.id)
    const data = await request.validateUsing(updateCropTypeValidator)
    await crop.merge(data).save()
    return response.ok(crop)
  }

  /**
   * DELETE /api/v1/crop-types/:id
   * Remove a crop type (only if no observations reference it)
   */
  async destroy({ params, response }: HttpContext) {
    const crop = await CropType.findOrFail(params.id)
    await crop.delete()
    return response.noContent()
  }

  /**
   * GET /api/v1/crop-types/categories
   * Return the distinct list of categories in the catalog
   */
  async categories({ response }: HttpContext) {
    const rows = await CropType.query()
      .select('category')
      .whereNotNull('category')
      .groupBy('category')
      .orderBy('category', 'asc')
      .exec()

    return response.ok(rows.map((r) => r.category))
  }
}
