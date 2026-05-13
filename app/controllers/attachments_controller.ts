import Attachment from '#models/attachment'
import { createAttachmentValidator, updateAttachmentValidator } from '#validators/attachment'
import type { HttpContext } from '@adonisjs/core/http'

export default class AttachmentsController {
  /**
   * GET /api/v1/attachments
   * List attachments, optionally scoped to an observation
   */
  async index({ request, response }: HttpContext) {
    const { observationId, uploadedBy, page = 1, limit = 20 } = request.qs()

    const query = Attachment.query()
      .preload('uploader')
      .orderBy('created_at', 'desc')

    if (observationId) query.where('observation_id', observationId)
    if (uploadedBy) query.where('uploaded_by', uploadedBy)

    const attachments = await query.paginate(Number(page), Number(limit))
    return response.ok(attachments)
  }

  /**
   * POST /api/v1/attachments
   * Register a new attachment (file already uploaded to storage/CDN)
   */
  async store({ request, response }: HttpContext) {
    const data = await request.validateUsing(createAttachmentValidator)
    const attachment = await Attachment.create(data)
    return response.created(attachment)
  }

  /**
   * GET /api/v1/attachments/:id
   * Get a single attachment record
   */
  async show({ params, response }: HttpContext) {
    const attachment = await Attachment.query()
      .where('id', params.id)
      .preload('observation')
      .preload('uploader')
      .preload('device')
      .firstOrFail()

    return response.ok(attachment)
  }

  /**
   * PATCH /api/v1/attachments/:id
   * Update caption or file type metadata
   */
  async update({ params, request, response }: HttpContext) {
    const attachment = await Attachment.findOrFail(params.id)
    const data = await request.validateUsing(updateAttachmentValidator)
    await attachment.merge(data).save()
    return response.ok(attachment)
  }

  /**
   * DELETE /api/v1/attachments/:id
   * Permanently remove an attachment record
   */
  async destroy({ params, response }: HttpContext) {
    const attachment = await Attachment.findOrFail(params.id)
    await attachment.delete()
    return response.noContent()
  }

  /**
   * GET /api/v1/observations/:observationId/attachments
   * Sub-resource: list all attachments for a specific observation
   */
  async byObservation({ params, response }: HttpContext) {
    const attachments = await Attachment.query()
      .where('observation_id', params.observationId)
      .preload('uploader')
      .orderBy('created_at', 'asc')
      .exec()

    return response.ok(attachments)
  }
}
