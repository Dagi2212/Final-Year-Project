import type { HttpContext } from '@adonisjs/core/http'
import { ImportService } from '#services/import_service'
import ImportJob from '#models/import_job'
import ImportedRecord from '#models/imported_record'
import AuditLog from '#models/audit_log'
import AppUser from '#models/app_user'
import { DateTime } from 'luxon'

export default class ImportsController {
  /**
   * POST /api/v1/imports
   * Upload a CSV or XLSX file and start an import job.
   */
  async store({ request, auth, response }: HttpContext) {
    const file = request.file('file', {
      extnames: ['csv', 'xlsx', 'xls'],
      size: '50mb',
    })

    if (!file || !file.isValid) {
      return response.unprocessableEntity({
        error: 'A valid CSV or XLSX file is required',
        details: file?.errors,
      })
    }

    const fileType = file.extname === 'csv' ? 'csv' : 'xlsx'
    const user = auth.user as any

    // Resolve AppUser by email to get the correct UUID for created_by
    let createdByUuid: string | null = null
    if (user?.email) {
      const appUser = await AppUser.query().select('id').where('email', user.email).first()
      createdByUuid = appUser?.id ?? null
    }

    const job = await ImportJob.create({
      createdBy: createdByUuid,
      fileName: file.clientName,
      fileType,
      fileSizeBytes: file.size,
      status: 'pending',
    })

    // Audit
    await AuditLog.create({
      userId: createdByUuid,
      tableName: 'import_jobs',
      recordId: job.id,
      action: 'IMPORT',
      newValues: { fileName: file.clientName, fileType },
      ipAddress: request.ip(),
      userAgent: request.header('user-agent') ?? null,
    })

    // Process synchronously for MVP (in production this would be a background job)
    try {
      await ImportJob.query().where('id', job.id).update({
        status: 'processing',
        startedAt: DateTime.now(),
      })

      // Read file bytes: prefer tmpPath (available immediately after upload)
      const fs = await import('node:fs/promises')
      let buffer: Buffer
      if (file.tmpPath) {
        buffer = await fs.readFile(file.tmpPath)
      } else {
        // Fallback: move to a stable path then read (tmpPath unavailable)
        const os = await import('node:os')
        const path = await import('node:path')
        const uploadDir = path.join(os.tmpdir(), 'adonis-imports')
        await fs.mkdir(uploadDir, { recursive: true })
        await file.move(uploadDir, { name: `${job.id}.${fileType}` })
        buffer = await fs.readFile(path.join(uploadDir, `${job.id}.${fileType}`))
      }

      const dryRun = request.input('dry_run', false)

      const { records, detectedSchema } =
        fileType === 'csv'
          ? await ImportService.parseCsv(buffer)
          : await ImportService.parseXlsx(buffer)

      const report = ImportService.buildValidationReport(records)

      if (dryRun) {
        await ImportJob.query().where('id', job.id).update({
          status: 'pending',
          schemaMapping: detectedSchema,
        })
        return response.ok({
          jobId: job.id,
          dryRun: true,
          detectedSchema,
          validation: report,
          sampleRows: records.slice(0, 5),
        })
      }

      // Persist records in batches
      const BATCH_SIZE = 200
      let importedRows = 0
      let skippedRows = 0
      const allErrors: Array<{ row: number; errors: string[] }> = []

      for (let i = 0; i < records.length; i += BATCH_SIZE) {
        const batch = records.slice(i, i + BATCH_SIZE)
        const rows = batch.map((r) => ({
          importJobId: job.id,
          sourceRow: r.sourceRow,
          kebele: r.kebele,
          region: r.region,
          cropName: r.cropName,
          cropCategory: r.cropCategory,
          areaHectares: r.areaHectares,
          expectedYieldKg: r.expectedYieldKg,
          actualYieldKg: r.actualYieldKg,
          rainfallMm: r.rainfallMm,
          temperatureCelsius: r.temperatureCelsius,
          season: r.season,
          year: r.year,
          plantingDate: r.plantingDate ? String(r.plantingDate) : null,
          harvestDate: r.harvestDate ? String(r.harvestDate) : null,
          fertilizerType: r.fertilizerType,
          fertilizerAmountKg: r.fertilizerAmountKg,
          pesticideUsed: r.pesticideUsed,
          irrigationType: r.irrigationType,
          soilType: r.soilType,
          rawValues: (() => {
            try {
              return r.rawValues ? JSON.parse(JSON.stringify(r.rawValues)) : null
            } catch {
              return {}
            }
          })(),
          status: r.status,
          validationErrors: r.validationErrors && r.validationErrors.length > 0 ? JSON.parse(JSON.stringify(r.validationErrors)) : null,
        }))

        await ImportedRecord.createMany(rows)
        importedRows += batch.filter((r) => r.status === 'valid').length
        skippedRows += batch.filter((r) => r.status !== 'valid').length
        batch
          .filter((r) => r.validationErrors.length > 0)
          .forEach((r) => allErrors.push({ row: r.sourceRow, errors: r.validationErrors }))
      }

      await ImportJob.query().where('id', job.id).update({
        status: 'completed',
        totalRows: records.length,
        importedRows,
        skippedRows,
        schemaMapping: detectedSchema,
        validationErrors: allErrors.length > 0 ? allErrors : null,
        completedAt: DateTime.now(),
      })

      return response.created({
        jobId: job.id,
        status: 'completed',
        detectedSchema,
        totalRows: records.length,
        importedRows,
        skippedRows,
        validationErrors: allErrors,
      })
    } catch (err: any) {
      await ImportJob.query().where('id', job.id).update({
        status: 'failed',
        errorMessage: err.message,
        completedAt: DateTime.now(),
      })
      return response.internalServerError({ error: 'Import failed', details: err.message })
    }
  }

  /**
   * GET /api/v1/imports
   * List import jobs.
   */
  async index({ request, auth, response }: HttpContext) {
    const { status, page = 1, limit = 20 } = request.qs()
    const user = auth.user as any

    const query = ImportJob.query().orderBy('created_at', 'desc')

    // Non-admin users can only see their own jobs
    if (user?.role !== 'admin' && user?.role !== 'supervisor') {
      let userUuid: string | null = null
      if (user?.email) {
        const appUser = await AppUser.query().select('id').where('email', user.email).first()
        userUuid = appUser?.id ?? null
      }
      if (userUuid) {
        query.where('created_by', userUuid)
      }
    }

    if (status) query.where('status', status)

    const jobs = await query.paginate(Number(page), Number(limit))
    return response.ok(jobs)
  }

  /**
   * GET /api/v1/imports/:id
   * Show a specific import job.
   */
  async show({ params, auth, response }: HttpContext) {
    const user = auth.user as any
    const job = await ImportJob.findOrFail(params.id)

    if (user?.role !== 'admin' && user?.role !== 'supervisor') {
      let userUuid: string | null = null
      if (user?.email) {
        const appUser = await AppUser.query().select('id').where('email', user.email).first()
        userUuid = appUser?.id ?? null
      }
      if (job.createdBy !== userUuid) {
        return response.forbidden({ error: 'Access denied' })
      }
    }

    return response.ok(job)
  }

  /**
   * GET /api/v1/imports/:id/records
   * List records for a specific import job.
   */
  async records({ params, request, auth, response }: HttpContext) {
    const user = auth.user as any
    const job = await ImportJob.findOrFail(params.id)

    if (user?.role !== 'admin' && user?.role !== 'supervisor') {
      let userUuid: string | null = null
      if (user?.email) {
        const appUser = await AppUser.query().select('id').where('email', user.email).first()
        userUuid = appUser?.id ?? null
      }
      if (job.createdBy !== userUuid) {
        return response.forbidden({ error: 'Access denied' })
      }
    }

    const { status, page = 1, limit = 50 } = request.qs()
    const query = ImportedRecord.query()
      .where('import_job_id', job.id)
      .orderBy('source_row', 'asc')

    if (status) query.where('status', status)

    const records = await query.paginate(Number(page), Number(limit))
    return response.ok(records)
  }

  /**
   * GET /api/v1/imports/:id/schema
   * Return the detected schema mapping for a job (useful for frontend to review before confirming).
   */
  async schema({ params, auth, response }: HttpContext) {
    const user = auth.user as any
    const job = await ImportJob.findOrFail(params.id)

    if (user?.role !== 'admin' && user?.role !== 'supervisor') {
      let userUuid: string | null = null
      if (user?.email) {
        const appUser = await AppUser.query().select('id').where('email', user.email).first()
        userUuid = appUser?.id ?? null
      }
      if (job.createdBy !== userUuid) {
        return response.forbidden({ error: 'Access denied' })
      }
    }

    return response.ok({
      jobId: job.id,
      fileName: job.fileName,
      fileType: job.fileType,
      status: job.status,
      schemaMapping: job.schemaMapping,
      totalRows: job.totalRows,
      importedRows: job.importedRows,
      skippedRows: job.skippedRows,
      validationErrors: job.validationErrors,
    })
  }
}
