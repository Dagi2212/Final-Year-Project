import { parse } from 'csv-parse'
import { Readable } from 'node:stream'
import ExcelJS from 'exceljs'

/**
 * Normalized record shape after schema detection + normalization.
 */
export interface NormalizedRecord {
  sourceRow: number
  kebele: string | null
  region: string | null
  cropName: string | null
  cropCategory: string | null
  areaHectares: number | null
  expectedYieldKg: number | null
  actualYieldKg: number | null
  rainfallMm: number | null
  temperatureCelsius: number | null
  season: string | null
  year: number | null
  plantingDate: string | null
  harvestDate: string | null
  fertilizerType: string | null
  fertilizerAmountKg: number | null
  pesticideUsed: string | null
  irrigationType: string | null
  soilType: string | null
  rawValues: Record<string, unknown>
  status: 'valid' | 'invalid' | 'skipped'
  validationErrors: string[]
}

/**
 * Schema detection result: maps detected column headers to canonical field names.
 */
export interface SchemaMapping {
  [csvColumn: string]: string
}

/**
 * ImportService handles CSV and Excel file parsing, automatic schema detection,
 * normalization, validation and outlier checks.
 */
export class ImportService {
  // ---------------------------------------------------------------------------
  // Column aliases: each canonical field maps to the header synonyms we accept
  // ---------------------------------------------------------------------------
  private static readonly COLUMN_ALIASES: Record<string, string[]> = {
    kebele: ['kebele', 'village', 'locality', 'location', 'sub_district'],
    region: ['region', 'zone', 'province', 'state', 'woreda', 'district'],
    cropName: [
      'crop',
      'crop_name',
      'crop name',
      'crop_type',
      'crop type',
      'plant',
      'item',
      'commodity',
    ],
    cropCategory: ['category', 'crop_category', 'crop category', 'type', 'crop_group'],
    areaHectares: ['area', 'area_ha', 'hectares', 'area_hectares', 'plot_size', 'farm_size'],
    expectedYieldKg: [
      'expected_yield',
      'expected yield',
      'expected_yield_kg',
      'predicted_yield',
      'target_yield',
    ],
    actualYieldKg: [
      'actual_yield',
      'actual yield',
      'actual_yield_kg',
      'yield',
      'production',
      'harvest',
      'yield_kg',
      'crop_production',
    ],
    rainfallMm: [
      'rainfall',
      'rainfall_mm',
      'precipitation',
      'rain',
      'annual_rainfall',
      'average_rainfall_mm_per_year',
      'average_rain_fall_mm_per_year',
    ],
    temperatureCelsius: [
      'temperature',
      'temp',
      'temp_celsius',
      'temperature_celsius',
      'avg_temp_c',
      'avg_temp',
    ],
    season: ['season', 'growing_season', 'period', 'meher', 'belg'],
    year: ['year', 'harvest_year', 'season_year', 'crop_year'],
    plantingDate: ['planting_date', 'planting date', 'sow_date', 'sowing_date', 'start_date'],
    harvestDate: ['harvest_date', 'harvest date', 'collection_date', 'end_date'],
    fertilizerType: ['fertilizer', 'fertilizer_type', 'fertiliser', 'fertilizer_name'],
    fertilizerAmountKg: ['fertilizer_amount', 'fertiliser_amount', 'fertilizer_kg'],
    pesticideUsed: ['pesticide', 'pesticide_used', 'chemical'],
    irrigationType: ['irrigation', 'irrigation_type', 'water_source'],
    soilType: ['soil', 'soil_type', 'soil_quality'],
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Detect schema from an array of header strings.
   */
  static detectSchema(headers: string[]): SchemaMapping {
    const mapping: SchemaMapping = {}
    for (const header of headers) {
      const canonical = this.findCanonical(header)
      if (canonical) {
        mapping[header] = canonical
      }
    }
    return mapping
  }

  /**
   * Parse a CSV buffer and return normalized records.
   */
  static async parseCsv(
    buffer: Buffer | Uint8Array,
    schemaMapping?: SchemaMapping
  ): Promise<{ records: NormalizedRecord[]; detectedSchema: SchemaMapping }> {
    const rows = await this.readCsvBuffer(buffer)
    if (rows.length === 0) return { records: [], detectedSchema: {} }

    const headers = Object.keys(rows[0])
    const schema = schemaMapping ?? this.detectSchema(headers)

    const records = rows.map((row, idx) => this.normalizeRow(row, schema, idx + 2)) // +2: 1-based, skip header
    return { records, detectedSchema: schema }
  }

  /**
   * Parse an Excel (XLSX) buffer and return normalized records.
   */
  static async parseXlsx(
    buffer: Buffer | Uint8Array,
    schemaMapping?: SchemaMapping
  ): Promise<{ records: NormalizedRecord[]; detectedSchema: SchemaMapping }> {
    const rows = await this.readXlsxBuffer(buffer)
    if (rows.length === 0) return { records: [], detectedSchema: {} }

    const headers = Object.keys(rows[0])
    const schema = schemaMapping ?? this.detectSchema(headers)

    const records = rows.map((row, idx) => this.normalizeRow(row, schema, idx + 2))
    return { records, detectedSchema: schema }
  }

  /**
   * Build a human-readable validation report from a set of normalized records.
   */
  static buildValidationReport(records: NormalizedRecord[]): {
    total: number
    valid: number
    invalid: number
    skipped: number
    errors: Array<{ row: number; errors: string[] }>
  } {
    const errors = records
      .filter((r) => r.status === 'invalid' && r.validationErrors.length > 0)
      .map((r) => ({ row: r.sourceRow, errors: r.validationErrors }))

    return {
      total: records.length,
      valid: records.filter((r) => r.status === 'valid').length,
      invalid: records.filter((r) => r.status === 'invalid').length,
      skipped: records.filter((r) => r.status === 'skipped').length,
      errors,
    }
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private static findCanonical(header: string): string | null {
    const normalizedHeader = header.trim().toLowerCase().replace(/[\s\-]+/g, '_')
    for (const [canonical, aliases] of Object.entries(this.COLUMN_ALIASES)) {
      if (aliases.includes(normalizedHeader) || aliases.includes(header.trim().toLowerCase())) {
        return canonical
      }
    }
    return null
  }

  private static normalizeRow(
    row: Record<string, unknown>,
    schema: SchemaMapping,
    rowNumber: number
  ): NormalizedRecord {
    const errors: string[] = []

    // Build canonical → value map
    const canonical: Record<string, unknown> = {}
    for (const [header, fieldName] of Object.entries(schema)) {
      canonical[fieldName] = row[header]
    }

    // String fields: trim whitespace
    const str = (v: unknown): string | null => {
      if (v == null || v === '') return null
      return String(v).trim()
    }

    // Numeric fields: coerce, flag invalid
    const num = (v: unknown, label: string): number | null => {
      if (v == null || v === '') return null
      const n = Number(v)
      if (Number.isNaN(n)) {
        errors.push(`${label}: "${v}" is not a valid number`)
        return null
      }
      return n
    }

    // Date fields: try ISO or DD/MM/YYYY
    const dateStr = (v: unknown, label: string): string | null => {
      if (v == null || v === '') return null
      const s = String(v).trim()
      // Try ISO 8601
      if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.substring(0, 10)
      // Try DD/MM/YYYY or MM/DD/YYYY
      const parts = s.split(/[\/\-]/)
      if (parts.length === 3) {
        const [a, b, c] = parts
        if (c.length === 4) {
          // DD/MM/YYYY
          return `${c}-${b.padStart(2, '0')}-${a.padStart(2, '0')}`
        }
        if (a.length === 4) {
          // YYYY/MM/DD
          return `${a}-${b.padStart(2, '0')}-${c.padStart(2, '0')}`
        }
      }
      errors.push(`${label}: "${v}" is not a recognisable date`)
      return null
    }

    const areaHectares = num(canonical['areaHectares'], 'area_hectares')
    const expectedYieldKg = num(canonical['expectedYieldKg'], 'expected_yield_kg')
    const actualYieldKg = num(canonical['actualYieldKg'], 'actual_yield_kg')
    const rainfallMm = num(canonical['rainfallMm'], 'rainfall_mm')
    const temperatureCelsius = num(canonical['temperatureCelsius'], 'temperature_celsius')
    const fertilizerAmountKg = num(canonical['fertilizerAmountKg'], 'fertilizer_amount_kg')

    // Year coercion
    let year: number | null = null
    if (canonical['year'] != null && canonical['year'] !== '') {
      year = num(canonical['year'], 'year')
      if (year !== null && (year < 1900 || year > 2100)) {
        errors.push(`year: "${year}" is outside the plausible range 1900–2100`)
      }
    }

    // Basic outlier checks
    if (areaHectares !== null && (areaHectares < 0 || areaHectares > 100_000)) {
      errors.push(`area_hectares: "${areaHectares}" seems out of plausible range (0–100 000 ha)`)
    }
    if (actualYieldKg !== null && (actualYieldKg < 0 || actualYieldKg > 1_000_000)) {
      errors.push(`actual_yield_kg: "${actualYieldKg}" seems out of plausible range`)
    }
    if (rainfallMm !== null && (rainfallMm < 0 || rainfallMm > 20_000)) {
      errors.push(`rainfall_mm: "${rainfallMm}" seems out of plausible range (0–20 000 mm/yr)`)
    }
    if (temperatureCelsius !== null && (temperatureCelsius < -90 || temperatureCelsius > 60)) {
      errors.push(`temperature_celsius: "${temperatureCelsius}" outside Earth surface range`)
    }

    // Season normalisation (lower-case)
    const rawSeason = str(canonical['season'])
    const season = rawSeason ? rawSeason.toLowerCase() : null

    // Determine record status
    const status: 'valid' | 'invalid' | 'skipped' =
      errors.length > 0
        ? 'invalid'
        : (canonical['cropName'] == null || str(canonical['cropName']) == null) &&
            actualYieldKg == null
          ? 'skipped'
          : 'valid'

    // Ensure rawValues is JSON-serializable by converting to/from JSON
    let sanitizedRawValues: Record<string, unknown> | null = null
    try {
      sanitizedRawValues = JSON.parse(JSON.stringify(row))
    } catch {
      // If row cannot be serialized, store empty object
      sanitizedRawValues = {}
    }

    return {
      sourceRow: rowNumber,
      kebele: str(canonical['kebele']),
      region: str(canonical['region']),
      cropName: str(canonical['cropName']),
      cropCategory: str(canonical['cropCategory']),
      areaHectares,
      expectedYieldKg,
      actualYieldKg,
      rainfallMm,
      temperatureCelsius,
      season,
      year,
      plantingDate: dateStr(canonical['plantingDate'], 'planting_date'),
      harvestDate: dateStr(canonical['harvestDate'], 'harvest_date'),
      fertilizerType: str(canonical['fertilizerType']),
      fertilizerAmountKg,
      pesticideUsed: str(canonical['pesticideUsed']),
      irrigationType: str(canonical['irrigationType']),
      soilType: str(canonical['soilType']),
      rawValues: sanitizedRawValues,
      status,
      validationErrors: errors,
    }
  }

  /** Read CSV buffer → array of raw row objects */
  private static readCsvBuffer(buffer: Buffer | Uint8Array): Promise<Record<string, unknown>[]> {
    return new Promise((resolve, reject) => {
      const rows: Record<string, unknown>[] = []
      const buf = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer)
      const readable = Readable.from(buf)
      readable
        .pipe(parse({ columns: true, skip_empty_lines: true, trim: true }))
        .on('data', (row: Record<string, unknown>) => rows.push(row))
        .on('end', () => resolve(rows))
        .on('error', reject)
    })
  }

  /** Read XLSX buffer → array of raw row objects */
  private static async readXlsxBuffer(buffer: Buffer | Uint8Array): Promise<Record<string, unknown>[]> {
    const workbook = new ExcelJS.Workbook()
    const buf = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer)
    // ExcelJS ships its own Buffer typedef that doesn't align with Node's generic
    // Buffer<ArrayBufferLike>; the double-cast through `unknown` is intentional.
    await workbook.xlsx.load(buf as unknown as Parameters<typeof workbook.xlsx.load>[0])

    const worksheet = workbook.worksheets[0]
    if (!worksheet) return []

    const rows: Record<string, unknown>[] = []
    let headers: string[] = []

    worksheet.eachRow((row, rowNumber) => {
      const values = row.values as (ExcelJS.CellValue | undefined)[]
      if (rowNumber === 1) {
        headers = values.slice(1).map((v) => (v != null ? String(v).trim() : ''))
        return
      }
      const obj: Record<string, unknown> = {}
      headers.forEach((h, i) => {
        const cell = row.getCell(i + 1)
        obj[h] = cell.value
      })
      rows.push(obj)
    })

    return rows
  }
}
