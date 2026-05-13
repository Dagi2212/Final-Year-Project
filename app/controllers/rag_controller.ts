import type { HttpContext } from '@adonisjs/core/http'
import AuditLog from '#models/audit_log'
import { RagService } from '#services/rag_service'
import { randomUUID } from 'node:crypto'

export default class RagController {
  /**
   * POST /api/v1/rag/query
   *
   * Submit a natural-language question against the agricultural dataset.
   * The RAG pipeline will:
   *   1. Retrieve relevant aggregates from PostgreSQL based on the question
   *   2. Build a structured context block from the retrieved data
   *   3. Call Claude (claude-haiku-4-5) with the context + question
   *   4. Return a grounded answer with data-source citations
   *
   * Body:
   *   question      {string}  required  – the natural language question
   *   dataset_type  {string}  optional  – 'observations' | 'imported_records' | 'farmers' | 'all'
   *   filters       {object}  optional  – key/value pairs: { region, crop_name, season, year }
   */
  async query({ request, auth, response }: HttpContext) {
    const user = auth.user as any
    const { question, dataset_type, filters } = request.body()

    // ── Validation ──────────────────────────────────────────────────────────
    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return response.unprocessableEntity({ error: 'question is required and must be a string' })
    }

    if (question.trim().length > 1000) {
      return response.unprocessableEntity({ error: 'question must be 1000 characters or fewer' })
    }

    const VALID_DATASET_TYPES = ['observations', 'imported_records', 'farmers', 'all']
    if (dataset_type && !VALID_DATASET_TYPES.includes(dataset_type)) {
      return response.unprocessableEntity({
        error: `dataset_type must be one of: ${VALID_DATASET_TYPES.join(', ')}`,
      })
    }

    const queryId = randomUUID()

    // ── Audit: record every query attempt for governance compliance ──────────
    await AuditLog.create({
      userId: user?.id ? String(user.id) : null,
      tableName: 'rag_queries',
      recordId: queryId,
      action: 'QUERY',
      newValues: {
        query_id: queryId,
        question: question.trim(),
        dataset_type: dataset_type ?? null,
        filters: filters ?? null,
        user_role: user?.role ?? null,
      },
      ipAddress: request.ip(),
      userAgent: request.header('user-agent') ?? null,
    })

    // ── Run RAG pipeline ─────────────────────────────────────────────────────
    try {
      const result = await RagService.query({
        question: question.trim(),
        dataset_type: dataset_type ?? null,
        filters: filters ?? null,
        userRole: user?.role ?? null,
      })

      // Audit the successful response (append token usage for cost tracking)
      await AuditLog.create({
        userId: user?.id ? String(user.id) : null,
        tableName: 'rag_queries',
        recordId: queryId,
        action: 'QUERY',
        newValues: {
          query_id: queryId,
          status: 'completed',
          tokens_used: result.tokens_used ?? null,
          citations_count: result.citations.length,
          context_summary: result.context_summary,
        },
        ipAddress: request.ip(),
        userAgent: request.header('user-agent') ?? null,
      })

      return response.ok({
        status: 'success',
        query_id: queryId,
        question: question.trim(),
        dataset_type: dataset_type ?? 'auto',
        answer: result.answer,
        citations: result.citations,
        context_summary: result.context_summary,
        tokens_used: result.tokens_used ?? null,
        llm_provider: 'Anthropic',
        llm_model: 'claude-haiku-4-5-20251001',
      })
    } catch (err: any) {
      // Audit the failure
      await AuditLog.create({
        userId: user?.id ? String(user.id) : null,
        tableName: 'rag_queries',
        recordId: queryId,
        action: 'QUERY',
        newValues: {
          query_id: queryId,
          status: 'failed',
          error: err.message,
        },
        ipAddress: request.ip(),
        userAgent: request.header('user-agent') ?? null,
      })

      const isConfigError = err.message?.includes('ANTHROPIC_API_KEY')
      return response.serviceUnavailable({
        status: 'error',
        query_id: queryId,
        error: isConfigError
          ? 'RAG service is not configured. Please set ANTHROPIC_API_KEY in your environment.'
          : 'RAG query failed. Please try again.',
        details: process.env.NODE_ENV !== 'production' ? err.message : undefined,
      })
    }
  }

  /**
   * GET /api/v1/rag/status
   *
   * Returns the current operational status of the RAG subsystem.
   * Useful for health dashboards and pre-flight checks.
   */
  async status({ response }: HttpContext) {
    try {
      const status = await RagService.status()
      const httpStatus = status.rag_status === 'ready' ? 200 : 503
      return response.status(httpStatus).json(status)
    } catch (err: any) {
      return response.serviceUnavailable({
        rag_status: 'error',
        error: err.message,
      })
    }
  }
}
