import type { HttpContext } from '@adonisjs/core/http'
import { MlService } from '#services/ml_service'
import Prediction from '#models/prediction'
import ImportedRecord from '#models/imported_record'
import AuditLog from '#models/audit_log'
import AppUser from '#models/app_user'

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const isUuid = (value: string | null): value is string => {
  return !!value && UUID_REGEX.test(value)
}

export default class PredictionsController {
  private async resolveRequestedBy(user: any): Promise<string | null> {
    const directId = user?.id ? String(user.id) : null
    if (isUuid(directId)) {
      return directId
    }

    const email = user?.email ? String(user.email).trim() : null
    if (!email) {
      return null
    }

    const appUser = await AppUser.query().where('email', email).first()
    return appUser?.id ?? null
  }

  /**
   * POST /api/v1/predictions
   * Request a yield prediction for a single imported record or an ad-hoc payload.
   */
  async store({ request, auth, response }: HttpContext) {
    const user = auth.user as any
    const requestedBy = await this.resolveRequestedBy(user)

    const {
      imported_record_id: importedRecordId,
      import_job_id: importJobId,
      // ad-hoc fields
      crop_name,
      area_hectares,
      rainfall_mm,
      temperature_celsius,
      fertilizer_amount_kg,
      season,
      year,
    } = request.body()

    // Resolve input features
    let inputFeatures: Record<string, unknown>

    if (importedRecordId) {
      const record = await ImportedRecord.findOrFail(importedRecordId)
      inputFeatures = {
        crop_name: record.cropName,
        area_hectares: record.areaHectares,
        rainfall_mm: record.rainfallMm,
        temperature_celsius: record.temperatureCelsius,
        fertilizer_amount_kg: record.fertilizerAmountKg,
        season: record.season,
        year: record.year,
      }
    } else {
      inputFeatures = { crop_name, area_hectares, rainfall_mm, temperature_celsius, fertilizer_amount_kg, season, year }
    }

    const prediction = await Prediction.create({
      requestedBy,
      importJobId: importJobId ?? null,
      importedRecordId: importedRecordId ?? null,
      modelVersion: 'unknown',
      modelType: 'yield_regression',
      inputFeatures,
      status: 'pending',
    })

    // Audit
    await AuditLog.create({
      userId: requestedBy,
      tableName: 'predictions',
      recordId: prediction.id,
      action: 'PREDICT',
      newValues: { importedRecordId, importJobId },
      ipAddress: request.ip(),
      userAgent: request.header('user-agent') ?? null,
    })

    try {
      const result = await MlService.predictYield(inputFeatures)

      await prediction
        .merge({
          predictedYieldKg: result.predicted_yield_kg,
          confidenceScore: result.confidence_score ?? null,
          modelVersion: result.model_version,
          rawOutput: result.raw_output,
          status: 'completed',
        })
        .save()

      return response.created(prediction)
    } catch (err: any) {
      await prediction.merge({ status: 'failed', errorMessage: err.message }).save()
      return response.serviceUnavailable({
        error: 'ML service unavailable',
        details: err.message,
        prediction_id: prediction.id,
      })
    }
  }

  /**
   * GET /api/v1/predictions
   * List predictions.
   */
  async index({ request, auth, response }: HttpContext) {
    const user = auth.user as any
    const { status, import_job_id, page = 1, limit = 20 } = request.qs()

    const query = Prediction.query().orderBy('created_at', 'desc')

    if (user?.role !== 'admin' && user?.role !== 'supervisor') {
      const requestedBy = await this.resolveRequestedBy(user)
      if (requestedBy) {
        query.where('requested_by', requestedBy)
      } else {
        query.whereRaw('1 = 0')
      }
    }

    if (status) query.where('status', status)
    if (import_job_id) query.where('import_job_id', import_job_id)

    const predictions = await query.paginate(Number(page), Number(limit))
    return response.ok(predictions)
  }

  /**
   * GET /api/v1/predictions/:id
   */
  async show({ params, response }: HttpContext) {
    const prediction = await Prediction.findOrFail(params.id)
    return response.ok(prediction)
  }

  /**
   * GET /api/v1/predictions/ml-health
   * Health check for the ML microservice.
   */
  async mlHealth({ response }: HttpContext) {
    const health = await MlService.healthCheck()
    const statusCode = health.status === 'ok' ? 200 : 503
    return response.status(statusCode).json(health)
  }
}
