import { test } from '@japa/runner'
import { ImportService } from '#services/import_service'

test.group('ImportService – schema detection', () => {
  test('detects standard Explore-AI column names', ({ assert }) => {
    const headers = ['Crop', 'Crop_Year', 'Season', 'State', 'Area', 'Production', 'Annual_Rainfall', 'Fertilizer', 'Pesticide', 'Yield']
    const schema = ImportService.detectSchema(headers)

    assert.equal(schema['Crop'], 'cropName')
    assert.equal(schema['Crop_Year'], 'year')
    assert.equal(schema['Season'], 'season')
    assert.equal(schema['Area'], 'areaHectares')
    assert.equal(schema['Production'], 'actualYieldKg')
    assert.equal(schema['Annual_Rainfall'], 'rainfallMm')
    assert.equal(schema['Fertilizer'], 'fertilizerAmountKg')
  })

  test('detects generic lower-case column names', ({ assert }) => {
    const headers = ['crop_name', 'actual_yield_kg', 'rainfall_mm', 'year', 'season']
    const schema = ImportService.detectSchema(headers)

    assert.equal(schema['crop_name'], 'cropName')
    assert.equal(schema['actual_yield_kg'], 'actualYieldKg')
    assert.equal(schema['rainfall_mm'], 'rainfallMm')
    assert.equal(schema['year'], 'year')
    assert.equal(schema['season'], 'season')
  })

  test('returns empty mapping for completely unknown headers', ({ assert }) => {
    const headers = ['foo', 'bar', 'baz']
    const schema = ImportService.detectSchema(headers)
    assert.deepEqual(schema, {})
  })
})

test.group('ImportService – CSV parsing & normalisation', () => {
  const validCsv = [
    'Crop,Crop_Year,Season,State,Area,Production,Annual_Rainfall,Fertilizer,Pesticide,Yield',
    'Maize,2021,Meher,Oromia,2.5,1250.0,850.0,120.0,5.2,500.0',
    'Wheat,2020,Meher,Amhara,1.8,720.0,620.0,90.0,3.1,400.0',
  ].join('\n')

  test('parses a valid CSV buffer', async ({ assert }) => {
    const buffer = Buffer.from(validCsv)
    const { records, detectedSchema } = await ImportService.parseCsv(buffer)

    assert.lengthOf(records, 2)
    assert.equal(detectedSchema['Crop'], 'cropName')

    const first = records[0]
    assert.equal(first.cropName, 'Maize')
    assert.equal(first.year, 2021)
    assert.equal(first.areaHectares, 2.5)
    assert.equal(first.actualYieldKg, 500.0)
    assert.equal(first.season, 'meher') // normalised to lower-case
    assert.equal(first.status, 'valid')
    assert.lengthOf(first.validationErrors, 0)
  })

  test('marks records with invalid numbers as invalid', async ({ assert }) => {
    const csv = [
      'crop_name,actual_yield_kg,area_hectares',
      'Maize,not-a-number,2.5',
    ].join('\n')
    const { records } = await ImportService.parseCsv(Buffer.from(csv))
    assert.equal(records[0].status, 'invalid')
    assert.isAbove(records[0].validationErrors.length, 0)
  })

  test('flags outlier area values', async ({ assert }) => {
    const csv = [
      'crop_name,actual_yield_kg,area_hectares',
      'Maize,500,999999',
    ].join('\n')
    const { records } = await ImportService.parseCsv(Buffer.from(csv))
    assert.equal(records[0].status, 'invalid')
    assert.isTrue(records[0].validationErrors.some(e => e.includes('area_hectares')))
  })

  test('marks empty rows as skipped', async ({ assert }) => {
    const csv = [
      'crop_name,actual_yield_kg',
      ',',
    ].join('\n')
    const { records } = await ImportService.parseCsv(Buffer.from(csv))
    assert.equal(records[0].status, 'skipped')
  })

  test('parses date in DD/MM/YYYY format', async ({ assert }) => {
    const csv = [
      'crop_name,planting_date,actual_yield_kg',
      'Wheat,15/03/2021,400',
    ].join('\n')
    const { records } = await ImportService.parseCsv(Buffer.from(csv))
    assert.equal(records[0].plantingDate, '2021-03-15')
  })

  test('parses date in ISO format', async ({ assert }) => {
    const csv = [
      'crop_name,harvest_date,actual_yield_kg',
      'Teff,2021-09-20,300',
    ].join('\n')
    const { records } = await ImportService.parseCsv(Buffer.from(csv))
    assert.equal(records[0].harvestDate, '2021-09-20')
  })
})

test.group('ImportService – validation report', () => {
  test('buildValidationReport counts correctly', ({ assert }) => {
    const records = [
      { sourceRow: 2, status: 'valid' as const, validationErrors: [] } as any,
      { sourceRow: 3, status: 'invalid' as const, validationErrors: ['bad value'] } as any,
      { sourceRow: 4, status: 'skipped' as const, validationErrors: [] } as any,
    ]
    const report = ImportService.buildValidationReport(records)
    assert.equal(report.total, 3)
    assert.equal(report.valid, 1)
    assert.equal(report.invalid, 1)
    assert.equal(report.skipped, 1)
    assert.lengthOf(report.errors, 1)
    assert.equal(report.errors[0].row, 3)
  })
})
