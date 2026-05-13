/**
 * RagService – Retrieval-Augmented Generation for agricultural data queries.
 *
 * Architecture
 * ────────────
 *  1. RETRIEVE  – Run targeted SQL queries against PostgreSQL to pull relevant
 *                 aggregates and records based on the user's question.
 *  2. AUGMENT   – Format retrieved data into a structured context block.
 *  3. GENERATE  – Send context + question to Claude (claude-haiku-4-5) and
 *                 stream back a grounded, cited answer.
 *
 * No vector store is required: the data is structured (crop names, regions,
 * yield figures, seasons) so SQL aggregation gives better precision than
 * embedding similarity for this domain.
 */

import env from '#start/env'
import db from '@adonisjs/lucid/services/db'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface RagQueryOptions {
  question: string
  /** Optional filter: restrict retrieval to a specific dataset type */
  dataset_type?: 'observations' | 'imported_records' | 'farmers' | 'all' | null
  /** Optional key/value filters forwarded to SQL (e.g. { region: 'Oromia' }) */
  filters?: Record<string, string | number | null> | null
  /** Role of the requesting user – controls which data is included in context */
  userRole?: string
}

export interface RagCitation {
  source: string
  description: string
  row_count: number
}

export interface RagQueryResult {
  answer: string
  citations: RagCitation[]
  context_summary: string
  tokens_used?: number
}

// ─────────────────────────────────────────────────────────────────────────────
// Retrieval helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Pull yield aggregates from the imported_records table.
 * Returns crop-level summaries (avg yield, area, rainfall, row counts).
 */
async function retrieveImportedYieldStats(
  filters?: Record<string, string | number | null> | null
): Promise<{ rows: Record<string, unknown>[]; description: string }> {
  const query = db
    .from('imported_records')
    .where('status', 'valid')
    .select(
      'crop_name',
      'region',
      'season',
      db.raw('COUNT(*) as record_count'),
      db.raw('AVG(actual_yield_kg) as avg_actual_yield_kg'),
      db.raw('AVG(expected_yield_kg) as avg_expected_yield_kg'),
      db.raw('AVG(area_hectares) as avg_area_hectares'),
      db.raw('AVG(rainfall_mm) as avg_rainfall_mm'),
      db.raw('AVG(temperature_celsius) as avg_temperature_celsius'),
      db.raw('AVG(fertilizer_amount_kg) as avg_fertilizer_kg'),
      db.raw('MIN(year) as earliest_year'),
      db.raw('MAX(year) as latest_year')
    )
    .groupBy('crop_name', 'region', 'season')
    .orderBy('record_count', 'desc')
    .limit(30)

  if (filters?.region) query.where('region', 'ilike', `%${filters.region}%`)
  if (filters?.crop_name) query.where('crop_name', 'ilike', `%${filters.crop_name}%`)
  if (filters?.season) query.where('season', 'ilike', `%${filters.season}%`)
  if (filters?.year) query.where('year', Number(filters.year))

  const rows = await query

  return {
    rows,
    description: `Yield statistics from imported historical records (${rows.length} crop/region/season groups)`,
  }
}

/**
 * Pull live observation data from field agents.
 * Returns crop-level summaries by organization / region.
 */
async function retrieveObservationStats(
  filters?: Record<string, string | number | null> | null
): Promise<{ rows: Record<string, unknown>[]; description: string }> {
  const query = db
    .from('observations as o')
    .join('plots as p', 'p.id', 'o.plot_id')
    .join('crop_types as ct', 'ct.id', 'o.crop_type_id')
    .whereNull('o.deleted_at')
    .select(
      'ct.name as crop_name',
      'p.location_region as region',
      'p.location_woreda as woreda',
      db.raw('COUNT(o.id) as observation_count'),
      db.raw('AVG(o.expected_yield_kg) as avg_expected_yield_kg'),
      db.raw('AVG(o.actual_yield_kg) as avg_actual_yield_kg'),
      db.raw('AVG(p.area_hectares) as avg_plot_area_hectares'),
      db.raw("SUM(CASE WHEN o.health_status = 'good' THEN 1 ELSE 0 END) as healthy_count"),
      db.raw("SUM(CASE WHEN o.pest_issues IS NOT NULL THEN 1 ELSE 0 END) as pest_issue_count")
    )
    .groupBy('ct.name', 'p.location_region', 'p.location_woreda')
    .orderBy('observation_count', 'desc')
    .limit(25)

  if (filters?.region) query.where('p.location_region', 'ilike', `%${filters.region}%`)
  if (filters?.crop_name) query.where('ct.name', 'ilike', `%${filters.crop_name}%`)

  const rows = await query

  return {
    rows,
    description: `Live field observations from agents (${rows.length} crop/region groups)`,
  }
}

/**
 * Pull farmer distribution statistics.
 */
async function retrieveFarmerStats(
  filters?: Record<string, string | number | null> | null
): Promise<{ rows: Record<string, unknown>[]; description: string }> {
  const query = db
    .from('farmers')
    .whereNull('deleted_at')
    .select(
      'location_region',
      'location_woreda',
      db.raw('COUNT(*) as farmer_count'),
      db.raw('AVG(household_size) as avg_household_size')
    )
    .groupBy('location_region', 'location_woreda')
    .orderBy('farmer_count', 'desc')
    .limit(20)

  if (filters?.region) query.where('location_region', 'ilike', `%${filters.region}%`)

  const rows = await query

  return {
    rows,
    description: `Farmer distribution by region/woreda (${rows.length} locations)`,
  }
}

/**
 * Pull recent ML prediction results for yield forecasting context.
 */
async function retrievePredictionStats(): Promise<{
  rows: Record<string, unknown>[]
  description: string
}> {
  const rows = await db
    .from('predictions')
    .where('status', 'completed')
    .select(
      db.raw('AVG(predicted_yield_kg) as avg_predicted_yield_kg'),
      db.raw('MIN(predicted_yield_kg) as min_predicted_yield_kg'),
      db.raw('MAX(predicted_yield_kg) as max_predicted_yield_kg'),
      db.raw('COUNT(*) as total_predictions'),
      'model_version'
    )
    .groupBy('model_version')
    .orderBy('total_predictions', 'desc')
    .limit(5)

  return {
    rows,
    description: `ML yield prediction statistics (${rows.length} model versions)`,
  }
}

/**
 * Pull top-level summary counts for general questions.
 */
async function retrieveSystemSummary(): Promise<{
  data: Record<string, unknown>
  description: string
}> {
  const [farmers, plots, observations, importedRecords, predictions] = await Promise.all([
    db.from('farmers').whereNull('deleted_at').count('* as total').first(),
    db.from('plots').whereNull('deleted_at').count('* as total').first(),
    db
      .from('observations')
      .whereNull('deleted_at')
      .select(
        db.raw('COUNT(*) as total'),
        db.raw('SUM(expected_yield_kg) as total_expected_yield_kg'),
        db.raw('SUM(actual_yield_kg) as total_actual_yield_kg')
      )
      .first(),
    db.from('imported_records').where('status', 'valid').count('* as total').first(),
    db.from('predictions').where('status', 'completed').count('* as total').first(),
  ])

  return {
    data: {
      total_farmers: Number(farmers?.total || 0),
      total_plots: Number(plots?.total || 0),
      total_observations: Number(observations?.total || 0),
      total_expected_yield_kg: Number(observations?.total_expected_yield_kg || 0),
      total_actual_yield_kg: Number(observations?.total_actual_yield_kg || 0),
      total_imported_records: Number(importedRecords?.total || 0),
      total_predictions: Number(predictions?.total || 0),
    },
    description: 'System-wide summary statistics',
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Context builder
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Decide which data sources to query based on the question content and
 * dataset_type filter, then assemble a structured context string.
 */
async function buildContext(
  options: RagQueryOptions
): Promise<{ context: string; citations: RagCitation[] }> {
  const { question, dataset_type, filters } = options
  const q = question.toLowerCase()

  // Heuristics to choose which data to fetch
  const wantsYield =
    q.includes('yield') ||
    q.includes('harvest') ||
    q.includes('production') ||
    q.includes('crop')
  const wantsFarmer = q.includes('farmer') || q.includes('kebele') || q.includes('household')
  const wantsObservation =
    q.includes('observation') || q.includes('field') || q.includes('health') || q.includes('pest')
  const wantsPrediction =
    q.includes('predict') || q.includes('forecast') || q.includes('model') || q.includes('ml')
  const wantsTrend =
    q.includes('trend') || q.includes('decline') || q.includes('increase') || q.includes('change')
  const wantsRegion =
    q.includes('region') ||
    q.includes('zone') ||
    q.includes('woreda') ||
    q.includes('oromia') ||
    q.includes('amhara') ||
    q.includes('tigray')

  // If dataset_type is explicitly set, use that to override heuristics
  const fetchImported =
    dataset_type === 'imported_records' ||
    dataset_type === 'all' ||
    (!dataset_type && (wantsYield || wantsTrend || wantsRegion))
  const fetchObservations =
    dataset_type === 'observations' ||
    dataset_type === 'all' ||
    (!dataset_type && (wantsObservation || wantsYield))
  const fetchFarmers =
    dataset_type === 'farmers' ||
    dataset_type === 'all' ||
    (!dataset_type && (wantsFarmer || wantsRegion))
  const fetchPredictions = !dataset_type && wantsPrediction

  const parts: string[] = []
  const citations: RagCitation[] = []

  // Always include system summary for grounding
  const summary = await retrieveSystemSummary()
  parts.push(`## System Overview\n${JSON.stringify(summary.data, null, 2)}`)
  citations.push({
    source: 'system_summary',
    description: summary.description,
    row_count: 1,
  })

  if (fetchImported) {
    const { rows, description } = await retrieveImportedYieldStats(filters)
    if (rows.length > 0) {
      parts.push(`## Historical Yield Data (Imported Records)\n${JSON.stringify(rows, null, 2)}`)
      citations.push({ source: 'imported_records', description, row_count: rows.length })
    }
  }

  if (fetchObservations) {
    const { rows, description } = await retrieveObservationStats(filters)
    if (rows.length > 0) {
      parts.push(
        `## Live Field Observations\n${JSON.stringify(rows, null, 2)}`
      )
      citations.push({ source: 'observations', description, row_count: rows.length })
    }
  }

  if (fetchFarmers) {
    const { rows, description } = await retrieveFarmerStats(filters)
    if (rows.length > 0) {
      parts.push(`## Farmer Distribution\n${JSON.stringify(rows, null, 2)}`)
      citations.push({ source: 'farmers', description, row_count: rows.length })
    }
  }

  if (fetchPredictions) {
    const { rows, description } = await retrievePredictionStats()
    if (rows.length > 0) {
      parts.push(`## ML Yield Predictions\n${JSON.stringify(rows, null, 2)}`)
      citations.push({ source: 'predictions', description, row_count: rows.length })
    }
  }

  return {
    context: parts.join('\n\n'),
    citations,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// LLM call (Claude via Anthropic API)
// ─────────────────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an agricultural data analyst assistant for Ethiopia's Integrated Agricultural Data System.
You help government officials, NGOs, researchers, and traders understand crop yield data, 
farmer distribution, field observations, and ML predictions across Ethiopian kebeles and regions.

You are given structured data retrieved from a live PostgreSQL database. Your job is to:
1. Answer the user's question accurately using ONLY the data provided in the context.
2. Be specific: cite regions, crop names, numbers, and seasons when they appear in the data.
3. Highlight meaningful patterns (e.g. declining yields, regional disparities, pest issues).
4. If the data does not contain enough information to answer, say so clearly.
5. Keep answers concise but informative (3-6 paragraphs max).
6. Use plain language suitable for both technical and non-technical stakeholders.
7. When relevant, mention data limitations (e.g. sample size, missing fields).

Ethiopian agricultural context: The main crops are teff, maize, wheat, sorghum, barley, and coffee.
The main seasons are Meher (main rainy season, Jun-Sep harvest) and Belg (short rains, Feb-May harvest).
Regions include Oromia, Amhara, Tigray, SNNPR, Somali, and others.`

async function callClaude(
  question: string,
  context: string
): Promise<{ answer: string; tokens_used: number }> {
  const apiKey = env.get('ANTHROPIC_API_KEY')
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured. Please add it to your .env file.')
  }

  const userMessage = `Here is the current agricultural data from the database:

${context}

---

Question: ${question}

Please analyze the data above and provide a clear, specific answer.`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Anthropic API error ${response.status}: ${body}`)
  }

  const data = (await response.json()) as {
    content: Array<{ type: string; text: string }>
    usage: { input_tokens: number; output_tokens: number }
  }

  const answer = data.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n')

  const tokens_used = (data.usage?.input_tokens ?? 0) + (data.usage?.output_tokens ?? 0)

  return { answer, tokens_used }
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export class RagService {
  /**
   * Run a full RAG pipeline for the given question.
   * Returns a grounded answer with citations pointing to the DB tables used.
   */
  static async query(options: RagQueryOptions): Promise<RagQueryResult> {
    // 1. Retrieve relevant data from the database
    const { context, citations } = await buildContext(options)

    // 2. Build a short human-readable summary of what was retrieved
    const context_summary = citations
      .map((c) => `${c.source} (${c.row_count} rows)`)
      .join(', ')

    // 3. Call Claude with the context
    const { answer, tokens_used } = await callClaude(options.question, context)

    return {
      answer,
      citations,
      context_summary,
      tokens_used,
    }
  }

  /**
   * Check whether the RAG subsystem is operational.
   */
  static async status(): Promise<{
    rag_status: string
    llm_provider: string
    llm_model: string
    api_key_configured: boolean
    db_accessible: boolean
  }> {
    let db_accessible = false
    try {
      await db.rawQuery('SELECT 1')
      db_accessible = true
    } catch {
      // db unreachable
    }

    const api_key_configured = Boolean(env.get('ANTHROPIC_API_KEY'))

    return {
      rag_status: api_key_configured && db_accessible ? 'ready' : 'degraded',
      llm_provider: 'Anthropic',
      llm_model: 'claude-haiku-4-5-20251001',
      api_key_configured,
      db_accessible,
    }
  }
}
