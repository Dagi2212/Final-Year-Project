import env from '#start/env'

/**
 * MlService: bridges the AdonisJS backend with the Python FastAPI ML microservice.
 */
export interface YieldPredictionInput {
  crop_name?: string | null
  area_hectares?: number | null
  rainfall_mm?: number | null
  temperature_celsius?: number | null
  fertilizer_amount_kg?: number | null
  season?: string | null
  year?: number | null
  [key: string]: unknown
}

export interface YieldPredictionResult {
  predicted_yield_kg: number
  confidence_score: number | null
  model_version: string
  raw_output: Record<string, unknown>
}

export class MlService {
  private static get baseUrl(): string {
    return env.get('ML_SERVICE_URL', 'http://localhost:8000')
  }

  private static readonly TIMEOUT_MS = 30_000

  /**
   * Call the ML microservice to predict yield for a single record.
   */
  static async predictYield(input: YieldPredictionInput): Promise<YieldPredictionResult> {
    const url = `${this.baseUrl}/predict/yield`
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), this.TIMEOUT_MS)

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
        signal: controller.signal,
      })

      if (!res.ok) {
        const body = await res.text()
        throw new Error(`ML service returned ${res.status}: ${body}`)
      }

      return (await res.json()) as YieldPredictionResult
    } finally {
      clearTimeout(timer)
    }
  }

  /**
   * Batch predictions: send multiple records at once.
   */
  static async predictYieldBatch(
    inputs: YieldPredictionInput[]
  ): Promise<YieldPredictionResult[]> {
    const url = `${this.baseUrl}/predict/yield/batch`
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), this.TIMEOUT_MS * 2)

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: inputs }),
        signal: controller.signal,
      })

      if (!res.ok) {
        const body = await res.text()
        throw new Error(`ML service returned ${res.status}: ${body}`)
      }

      return (await res.json()) as YieldPredictionResult[]
    } finally {
      clearTimeout(timer)
    }
  }

  /**
   * Health check for the ML service.
   */
  static async healthCheck(): Promise<{ status: string; model_version?: string }> {
    const url = `${this.baseUrl}/health`
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 5_000)
    try {
      const res = await fetch(url, { signal: controller.signal })
      if (!res.ok) return { status: 'unhealthy' }
      return (await res.json()) as { status: string; model_version?: string }
    } catch {
      return { status: 'unreachable' }
    } finally {
      clearTimeout(timer)
    }
  }
}
