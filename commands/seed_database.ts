import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import db from '@adonisjs/lucid/services/db'
import hash from '@adonisjs/core/services/hash'
import { randomUUID } from 'node:crypto'

export default class SeedDatabase extends BaseCommand {
  static commandName = 'seed:database'
  static description = 'Seed all tables with 10-15 records each (realistic Ethiopian agricultural data)'

  static options: CommandOptions = {
    startApp: true,
  }

  private readonly PASSWORD = 'password123'

  async run() {
    this.logger.info('')
    this.logger.info('╔══════════════════════════════════════════════════╗')
    this.logger.info('║        IADS Database Seeder                     ║')
    this.logger.info('╚══════════════════════════════════════════════════╝')
    this.logger.info('')

    const passwordHash = await hash.make(this.PASSWORD)

    // ── Tables without FK dependencies ──────────────────────────────
    const userIds = await this.seedUsers(passwordHash)
    const orgIds = await this.seedOrganizations()
    const cropTypeIds = await this.seedCropTypes()
    const productIds = await this.seedProducts()

    // ── Tables depending on the above ───────────────────────────────
    const appUserIds = await this.seedAppUsers(orgIds, passwordHash)
    const deviceIds = await this.seedDevices(appUserIds)
    const farmerIds = await this.seedFarmers(orgIds, appUserIds, deviceIds)
    const plotIds = await this.seedPlots(farmerIds, appUserIds, deviceIds)
    const observationIds = await this.seedObservations(plotIds, cropTypeIds, appUserIds, deviceIds)
    await this.seedAttachments(observationIds, appUserIds, deviceIds)
    await this.seedSyncQueue(deviceIds, appUserIds)
    await this.seedAuditLogs(appUserIds)
    const importJobIds = await this.seedImportJobs(appUserIds, userIds)
    await this.seedImportedRecords(importJobIds)
    await this.seedDatasetPermissions(appUserIds)
    await this.seedPredictions(appUserIds, importJobIds)
    await this.seedSubscriptions(appUserIds, productIds)
    await this.seedTransactions(appUserIds, productIds)

    this.logger.info('')
    this.logger.info('╔══════════════════════════════════════════════════╗')
    this.logger.info('║        Seeding Complete!                        ║')
    this.logger.info('╚══════════════════════════════════════════════════╝')
    this.logger.info(`  Login with any seeded email / ${this.PASSWORD}`)
    this.logger.info('')
  }

  // ────────────────────────────────────────────────────────────────
  // 1. users (INTEGER PK, auto-increment)
  // ────────────────────────────────────────────────────────────────
  private async seedUsers(passwordHash: string): Promise<number[]> {
    this.logger.info('[1/18] Seeding users...')
    const ids: number[] = []
    const seeds = [
      { email: 'admin@example.com', fullName: 'Admin User' },
      { email: 'field_agent@example.com', fullName: 'Field Agent User' },
      { email: 'supervisor@example.com', fullName: 'Supervisor User' },
      { email: 'gov@example.com', fullName: 'Government User' },
      { email: 'ngo@example.com', fullName: 'NGO User' },
      { email: 'trader@example.com', fullName: 'Trader User' },
      { email: 'researcher@example.com', fullName: 'Researcher User' },
    ]
    for (const s of seeds) {
      const existing = await db.from('users').where('email', s.email).first()
      if (existing) {
        ids.push(existing.id)
        this.logger.info(`  · ${s.email} — already exists (id=${existing.id})`)
        continue
      }
      await db.table('users').insert({ full_name: s.fullName, email: s.email, password: passwordHash, created_at: db.raw('NOW()'), updated_at: db.raw('NOW()') })
      const [user] = await db.from('users').where('email', s.email).select('id')
      ids.push(user.id)
      this.logger.info(`  ✓ ${s.email} — created (id=${user.id})`)
    }
    return ids
  }

  // ────────────────────────────────────────────────────────────────
  // 2. organizations
  // ────────────────────────────────────────────────────────────────
  private async seedOrganizations(): Promise<string[]> {
    this.logger.info('[2/18] Seeding organizations...')
    const seeds = [
      { name: 'Selam Cooperative Union', type: 'cooperative', region: 'Tigray', contact_phone: '+251-911-001-001' },
      { name: 'Ethiopian Agricultural Transformation Agency', type: 'government', region: 'Addis Ababa', contact_phone: '+251-111-002-002' },
      { name: 'Farm Africa Ethiopia', type: 'ngo', region: 'Oromia', contact_phone: '+251-911-003-003' },
      { name: 'Meru Agro Plc', type: 'private', region: 'Amhara', contact_phone: '+251-922-004-004' },
      { name: 'Sidama Coffee Farmers Cooperative', type: 'cooperative', region: 'Sidama', contact_phone: '+251-933-005-005' },
    ]
    return this.seedUuidTable('organizations', seeds.map(s => ({ ...s, id: randomUUID() })), 'name')
  }

  // ────────────────────────────────────────────────────────────────
  // 3. crop_types (5 already seeded by migration, add 5 more = 10)
  // ────────────────────────────────────────────────────────────────
  private async seedCropTypes(): Promise<string[]> {
    this.logger.info('[3/18] Seeding crop types...')
    const allIds: string[] = []

    // Read existing
    const existing = await db.from('crop_types').select('id', 'name')
    for (const r of existing) {
      allIds.push(r.id)
    }
    if (existing.length > 0) {
      this.logger.info(`  · ${existing.length} crop types already exist (from migration seed)`)
    }

    const additional = [
      { name: 'Coffee', local_name: 'ቡና', category: 'cash_crop', description: 'Arabica coffee — Ethiopia\'s flagship export' },
      { name: 'Sesame', local_name: 'ሰሊጥ', category: 'oilseed', description: 'High-value oilseed grown in Humera, Gondar' },
      { name: 'Khat', local_name: 'ጫት', category: 'cash_crop', description: 'Fresh leaf stimulant crop' },
      { name: 'Haricot Bean', local_name: 'ባቄላ', category: 'pulse', description: 'Common dry bean for local consumption and export' },
      { name: 'Enset', local_name: 'እንሰት', category: 'staple', description: 'False banana — traditional staple in SNNPR' },
    ]

    const existingNames = new Set(existing.map((r: any) => r.name.toLowerCase()))
    for (const crop of additional) {
      if (existingNames.has(crop.name.toLowerCase())) {
        this.logger.info(`  · ${crop.name} — already exists`)
        continue
      }
      const id = randomUUID()
      await db.table('crop_types').insert({ id, ...crop, created_at: db.raw('NOW()') })
      allIds.push(id)
      this.logger.info(`  ✓ ${crop.name} (${crop.localName}) — created`)
    }
    return allIds
  }

  // ────────────────────────────────────────────────────────────────
  // 4. products
  // ────────────────────────────────────────────────────────────────
  private async seedProducts(): Promise<string[]> {
    this.logger.info('[4/18] Seeding products...')
    const seeds = [
      { name: 'Yield Dataset Export', description: 'Export yield prediction data as CSV/Excel', product_type: 'dataset_export', price_usd: 49.99, is_active: true },
      { name: 'Seasonal Analytics Report', description: 'Detailed analytics report for a growing season', product_type: 'analytics_report', price_usd: 99.99, is_active: true },
      { name: 'Pro Subscription — 6 months', description: 'Full platform access for 6 months', product_type: 'subscription', price_usd: 199.99, is_active: true },
      { name: 'Pay-per-Query (RAG)', description: 'One-time AI query against the knowledge base', product_type: 'pay_per_query', price_usd: 4.99, is_active: true },
      { name: 'Enterprise Dataset Access', description: 'Full access to all historical yield datasets', product_type: 'dataset_export', price_usd: 299.99, is_active: true },
    ]
    return this.seedUuidTable('products', seeds.map(s => ({ id: randomUUID(), ...s })), 'name')
  }

  // ────────────────────────────────────────────────────────────────
  // 5. app_users
  // ────────────────────────────────────────────────────────────────
  private async seedAppUsers(orgIds: string[], passwordHash: string): Promise<string[]> {
    this.logger.info('[5/18] Seeding app users...')
    const ids: string[] = []
    const seeds = [
      { email: 'admin@example.com', fullName: 'Admin User', role: 'admin', phone: '+251-911-100-001', orgIdx: 1 },
      { email: 'field_agent@example.com', fullName: 'Field Agent User', role: 'field_agent', phone: '+251-911-100-002', orgIdx: 0 },
      { email: 'supervisor@example.com', fullName: 'Supervisor User', role: 'supervisor', phone: '+251-911-100-003', orgIdx: 0 },
      { email: 'gov@example.com', fullName: 'Government User', role: 'gov', phone: '+251-911-100-004', orgIdx: 1 },
      { email: 'ngo@example.com', fullName: 'NGO User', role: 'ngo', phone: '+251-911-100-005', orgIdx: 2 },
      { email: 'trader@example.com', fullName: 'Trader User', role: 'trader', phone: '+251-911-100-006', orgIdx: 3 },
      { email: 'researcher@example.com', fullName: 'Researcher User', role: 'researcher', phone: '+251-911-100-007', orgIdx: null },
      { email: 'alemitu@selam.coop', fullName: 'Alemitu Bekele', role: 'field_agent', phone: '+251-911-100-008', orgIdx: 0 },
      { email: 'tadesse@selam.coop', fullName: 'Tadesse Wondimu', role: 'supervisor', phone: '+251-911-100-009', orgIdx: 0 },
      { email: 'hiwot@ata.gov.et', fullName: 'Hiwot Desta', role: 'gov', phone: '+251-911-100-010', orgIdx: 1 },
      { email: 'chaltu@farmafrica.org', fullName: 'Chaltu Mohammed', role: 'ngo', phone: '+251-911-100-011', orgIdx: 2 },
      { email: 'mekdes@meruagro.com', fullName: 'Mekdes Asfaw', role: 'trader', phone: '+251-911-100-012', orgIdx: 3 },
      { email: 'dawit@research.et', fullName: 'Dawit Lemma', role: 'researcher', phone: '+251-911-100-013', orgIdx: 4 },
    ]
    for (const s of seeds) {
      const existing = await db.from('app_users').where('email', s.email).first()
      if (existing) {
        ids.push(existing.id)
        this.logger.info(`  · ${s.email} — already exists`)
        continue
      }
      const id = randomUUID()
      await db.table('app_users').insert({
        id,
        organization_id: s.orgIdx !== null && s.orgIdx < orgIds.length ? orgIds[s.orgIdx] : null,
        email: s.email,
        full_name: s.fullName,
        role: s.role,
        phone: s.phone,
        is_active: true,
        password_hash: passwordHash,
        created_at: db.raw('NOW()'),
        updated_at: db.raw('NOW()'),
      })
      ids.push(id)
      this.logger.info(`  ✓ ${s.email} (${s.role})`)
    }
    return ids
  }

  // ────────────────────────────────────────────────────────────────
  // 6. devices
  // ────────────────────────────────────────────────────────────────
  private async seedDevices(appUserIds: string[]): Promise<string[]> {
    this.logger.info('[6/18] Seeding devices...')
    const brands = ['Samsung Galaxy Tab A8', 'Samsung Galaxy A14', 'Tecno Spark 10', 'Infinix Note 30', 'Huawei Y9']
    const ids: string[] = []
    for (let i = 0; i < Math.min(appUserIds.length, 7); i++) {
      for (let j = 0; j < 2; j++) {
        const id = randomUUID()
        const deviceUuid = randomUUID()
        const existing = await db.from('devices').where('device_uuid', deviceUuid).first()
        if (existing) {
          ids.push(existing.id)
          continue
        }
        await db.table('devices').insert({
          id,
          user_id: appUserIds[i],
          device_name: brands[(i + j) % brands.length],
          device_uuid: deviceUuid,
          last_sync_at: db.raw(`NOW() - INTERVAL '${Math.floor(Math.random() * 168)} hours'`),
          created_at: db.raw('NOW()'),
        })
        ids.push(id)
      }
    }
    this.logger.info(`  · ${ids.length} devices created`)
    return ids
  }

  // ────────────────────────────────────────────────────────────────
  // 7. farmers
  // ────────────────────────────────────────────────────────────────
  private async seedFarmers(orgIds: string[], appUserIds: string[], deviceIds: string[]): Promise<string[]> {
    this.logger.info('[7/18] Seeding farmers...')
    const seeds = [
      { fullName: 'Abebe Kebede', phone: '+251-944-010-001', region: 'Tigray', zone: 'Mekelle', woreda: 'Enderta', hh: 6, orgIdx: 0, notes: 'Experienced teff and wheat farmer' },
      { fullName: 'Lemlem Hailu', phone: '+251-944-010-002', region: 'Tigray', zone: 'Adwa', woreda: 'Adwa', hh: 4, orgIdx: 0, notes: 'Female-headed household, grows sorghum' },
      { fullName: 'Girma Tesfaye', phone: '+251-944-010-003', region: 'Amhara', zone: 'South Gondar', woreda: 'Fogera', hh: 7, orgIdx: 3, notes: 'Rice and maize producer near Lake Tana' },
      { fullName: 'Worknesh Ayele', phone: '+251-944-010-004', region: 'Amhara', zone: 'North Shewa', woreda: 'Menz', hh: 5, orgIdx: 3, notes: 'Barley and potato farmer' },
      { fullName: 'Tolosa Gemeda', phone: '+251-944-010-005', region: 'Oromia', zone: 'Arsi', woreda: 'Tiyo', hh: 8, orgIdx: 1, notes: 'Large-scale wheat producer' },
      { fullName: 'Aynalem Desta', phone: '+251-944-010-006', region: 'Oromia', zone: 'Jimma', woreda: 'Mana', hh: 5, orgIdx: 2, notes: 'Coffee farmer, organic practices' },
      { fullName: 'Mulugeta Shiferaw', phone: '+251-944-010-007', region: 'SNNPR', zone: 'Wolayita', woreda: 'Sodo', hh: 6, orgIdx: 2, notes: 'Enset and root crop farmer' },
      { fullName: 'Zeritu Desalegn', phone: '+251-944-010-008', region: 'SNNPR', zone: 'Gamo', woreda: 'Arba Minch', hh: 4, orgIdx: 2, notes: 'Banana and fruit producer' },
      { fullName: 'Bekele Amanuel', phone: '+251-944-010-009', region: 'Sidama', zone: 'Hawassa', woreda: 'Wondo Genet', hh: 7, orgIdx: 4, notes: 'Coffee and enset farmer' },
      { fullName: 'Hailu Gebre', phone: '+251-944-010-010', region: 'Tigray', zone: 'Central', woreda: 'Atsbi', hh: 5, orgIdx: 0, notes: 'Irrigation farmer, dry-season vegetables' },
      { fullName: 'Fatuma Usman', phone: '+251-944-010-011', region: 'Somali', zone: 'Shinile', woreda: 'Shinile', hh: 6, orgIdx: 1, notes: 'Pastoralist with crop farming' },
      { fullName: 'Kebede Assefa', phone: '+251-944-010-012', region: 'Oromia', zone: 'Bale', woreda: 'Goba', hh: 8, orgIdx: 1, notes: 'Highland barley and wheat' },
    ]
    const ids: string[] = []
    for (let i = 0; i < seeds.length; i++) {
      const s = seeds[i]
      const id = randomUUID()
      await db.table('farmers').insert({
        id,
        organization_id: orgIds[s.orgIdx % orgIds.length],
        full_name: s.fullName,
        phone: s.phone,
        location_region: s.region,
        location_zone: s.zone,
        location_woreda: s.woreda,
        household_size: s.hh,
        notes: s.notes,
        created_by: appUserIds[i % appUserIds.length],
        device_id: deviceIds[i % deviceIds.length],
        client_created_at: db.raw(`NOW() - INTERVAL '${30 + i} days'`),
        client_updated_at: db.raw(`NOW() - INTERVAL '${7 + i} days'`),
        created_at: db.raw(`NOW() - INTERVAL '${30 + i} days'`),
        updated_at: db.raw(`NOW() - INTERVAL '${7 + i} days'`),
      })
      ids.push(id)
    }
    this.logger.info(`  ✓ ${seeds.length} farmers created`)
    return ids
  }

  // ────────────────────────────────────────────────────────────────
  // 8. plots
  // ────────────────────────────────────────────────────────────────
  private async seedPlots(farmerIds: string[], appUserIds: string[], deviceIds: string[]): Promise<string[]> {
    this.logger.info('[8/18] Seeding plots...')
    const seeds: { farmerIdx: number; name: string; areaSqm: number; areaLocal: string; lat: number; lng: number; alt: number; soil: string; irrig: boolean }[] = [
      { farmerIdx: 0, name: 'Kuda Field', areaSqm: 20000, areaLocal: '2 hectares', lat: 13.4967, lng: 39.4667, alt: 2100, soil: 'Vertisol', irrig: false },
      { farmerIdx: 0, name: 'May Hibey Plot', areaSqm: 15000, areaLocal: '1.5 hectares', lat: 13.4980, lng: 39.4680, alt: 2080, soil: 'Vertisol', irrig: false },
      { farmerIdx: 1, name: 'Adwa Slope', areaSqm: 10000, areaLocal: '1 hectare', lat: 14.1667, lng: 38.9000, alt: 1900, soil: 'Cambisol', irrig: false },
      { farmerIdx: 2, name: 'Fogera Lowland', areaSqm: 30000, areaLocal: '3 hectares', lat: 11.7833, lng: 37.6833, alt: 1780, soil: 'Nitosol', irrig: true },
      { farmerIdx: 3, name: 'Menz Highland', areaSqm: 12000, areaLocal: '1.2 hectares', lat: 10.5000, lng: 39.5000, alt: 2900, soil: 'Andosol', irrig: false },
      { farmerIdx: 4, name: 'Arsi Plain', areaSqm: 40000, areaLocal: '4 hectares', lat: 7.9000, lng: 39.1000, alt: 2300, soil: 'Nitosol', irrig: false },
      { farmerIdx: 5, name: 'Mana Coffee Garden', areaSqm: 8000, areaLocal: '0.8 hectares', lat: 7.6667, lng: 36.6833, alt: 1750, soil: 'Luvisol', irrig: false },
      { farmerIdx: 6, name: 'Sodo Garden', areaSqm: 5000, areaLocal: '0.5 hectares', lat: 7.0667, lng: 37.6833, alt: 2050, soil: 'Vertisol', irrig: true },
      { farmerIdx: 7, name: 'Arba Minch Riverside', areaSqm: 15000, areaLocal: '1.5 hectares', lat: 6.0333, lng: 37.5500, alt: 1280, soil: 'Cambisol', irrig: true },
      { farmerIdx: 8, name: 'Wondo Genet Plot', areaSqm: 12000, areaLocal: '1.2 hectares', lat: 7.1000, lng: 38.6333, alt: 1780, soil: 'Luvisol', irrig: false },
      { farmerIdx: 9, name: 'Atsbi Dry Farm', areaSqm: 18000, areaLocal: '1.8 hectares', lat: 14.0667, lng: 39.7167, alt: 2560, soil: 'Andosol', irrig: true },
      { farmerIdx: 10, name: 'Shinile Plot', areaSqm: 25000, areaLocal: '2.5 hectares', lat: 10.5000, lng: 42.0000, alt: 950, soil: 'Vertisol', irrig: false },
      { farmerIdx: 11, name: 'Goba Highland Field', areaSqm: 22000, areaLocal: '2.2 hectares', lat: 7.0167, lng: 40.0000, alt: 2700, soil: 'Andosol', irrig: false },
      { farmerIdx: 5, name: 'Jimma Second Garden', areaSqm: 6000, areaLocal: '0.6 hectares', lat: 7.6700, lng: 36.6900, alt: 1760, soil: 'Luvisol', irrig: false },
    ]
    const ids: string[] = []
    for (let i = 0; i < seeds.length; i++) {
      const s = seeds[i]
      const id = randomUUID()
      await db.table('plots').insert({
        id,
        farmer_id: farmerIds[s.farmerIdx],
        plot_name: s.name,
        area_sqm: s.areaSqm,
        area_local: s.areaLocal,
        latitude: s.lat,
        longitude: s.lng,
        altitude: s.alt,
        soil_type: s.soil,
        irrigation: s.irrig,
        created_by: appUserIds[i % appUserIds.length],
        device_id: deviceIds[i % deviceIds.length],
        version: 1,
        client_created_at: db.raw(`NOW() - INTERVAL '${25 + i} days'`),
        client_updated_at: db.raw(`NOW() - INTERVAL '${5 + i} days'`),
        created_at: db.raw(`NOW() - INTERVAL '${25 + i} days'`),
        updated_at: db.raw(`NOW() - INTERVAL '${5 + i} days'`),
      })
      ids.push(id)
    }
    this.logger.info(`  ✓ ${seeds.length} plots created`)
    return ids
  }

  // ────────────────────────────────────────────────────────────────
  // 9. observations
  // ────────────────────────────────────────────────────────────────
  private async seedObservations(plotIds: string[], cropTypeIds: string[], appUserIds: string[], deviceIds: string[]): Promise<string[]> {
    this.logger.info('[9/18] Seeding observations...')
    const seeds: { plotIdx: number; cropIdx: number; planting: string; expected: number; actual: number | null; stage: string; health: string; pests: string | null; fertilizer: boolean; notes: string }[] = [
      { plotIdx: 0, cropIdx: 0, planting: '2025-06-15', expected: 4500, actual: 4200, stage: 'harvested', health: 'good', pests: null, fertilizer: true, notes: 'Good teff yield despite low rainfall' },
      { plotIdx: 1, cropIdx: 0, planting: '2025-06-20', expected: 4000, actual: 3800, stage: 'harvested', health: 'fair', pests: 'Minor armyworm', fertilizer: true, notes: 'Slight pest pressure in early stage' },
      { plotIdx: 2, cropIdx: 3, planting: '2025-07-01', expected: 5000, actual: 4700, stage: 'grain_filling', health: 'good', pests: null, fertilizer: true, notes: 'Good rainfall this season' },
      { plotIdx: 3, cropIdx: 2, planting: '2025-05-01', expected: 8000, actual: 7600, stage: 'harvested', health: 'good', pests: 'Stem borer (treated)', fertilizer: true, notes: 'Irrigation supplemented rain' },
      { plotIdx: 4, cropIdx: 4, planting: '2025-06-01', expected: 3500, actual: 3200, stage: 'flowering', health: 'good', pests: null, fertilizer: false, notes: 'Organic farming, no chemicals' },
      { plotIdx: 5, cropIdx: 1, planting: '2025-07-15', expected: 6000, actual: 5800, stage: 'maturity', health: 'good', pests: 'Aphids (controlled)', fertilizer: true, notes: 'Arsi produces best wheat in country' },
      { plotIdx: 6, cropIdx: 5, planting: '2024-04-01', expected: 2500, actual: 2800, stage: 'harvested', health: 'good', pests: null, fertilizer: false, notes: 'Coffee cherry harvest above target' },
      { plotIdx: 7, cropIdx: 9, planting: '2024-03-01', expected: 18000, actual: 16500, stage: 'harvested', health: 'fair', pests: 'Mealybug (localized)', fertilizer: false, notes: 'Enset is drought resistant' },
      { plotIdx: 8, cropIdx: 8, planting: '2025-02-01', expected: 12000, actual: null, stage: 'vegetative', health: 'good', pests: null, fertilizer: false, notes: 'New planting, still growing' },
      { plotIdx: 9, cropIdx: 5, planting: '2024-05-01', expected: 3000, actual: 2700, stage: 'harvested', health: 'good', pests: null, fertilizer: false, notes: 'Organic shade-grown coffee' },
      { plotIdx: 10, cropIdx: 0, planting: '2025-07-01', expected: 3800, actual: 3500, stage: 'grain_filling', health: 'fair', pests: 'Grasshoppers (sprayed)', fertilizer: true, notes: 'Dryland farming with irrigation' },
      { plotIdx: 11, cropIdx: 6, planting: '2025-08-01', expected: 1500, actual: null, stage: 'flowering', health: 'good', pests: null, fertilizer: true, notes: 'First sesame trial in Shinile' },
      { plotIdx: 12, cropIdx: 4, planting: '2025-05-15', expected: 4000, actual: 3800, stage: 'maturity', health: 'good', pests: null, fertilizer: false, notes: 'Highland barley for local beer' },
      { plotIdx: 13, cropIdx: 5, planting: '2024-06-01', expected: 2200, actual: 2400, stage: 'harvested', health: 'good', pests: null, fertilizer: false, notes: 'Coffee intercropped with enset' },
    ]
    const ids: string[] = []
    for (let i = 0; i < seeds.length; i++) {
      const s = seeds[i]
      const id = randomUUID()
      await db.table('observations').insert({
        id,
        plot_id: plotIds[s.plotIdx],
        crop_type_id: cropTypeIds[s.cropIdx % cropTypeIds.length],
        planting_date: s.planting,
        expected_yield_kg: s.expected,
        actual_yield_kg: s.actual,
        yield_estimate_date: s.actual ? db.raw(`'${s.planting}'::date + INTERVAL '${140 + Math.floor(Math.random() * 30)} days'`) : null,
        growth_stage: s.stage,
        health_status: s.health,
        pest_issues: s.pests,
        fertilizer_used: s.fertilizer,
        notes: s.notes,
        metadata: db.raw(`'{"source":"mobile_app","season":"${['meher','belg','meher','meher','belg','meher','meher','meher','belg','meher','meher','meher','meher','meher'][i]}"}'::jsonb`),
        created_by: appUserIds[i % appUserIds.length],
        device_id: deviceIds[i % deviceIds.length],
        version: 1,
        client_created_at: db.raw(`NOW() - INTERVAL '${20 + i} days'`),
        client_updated_at: db.raw(`NOW() - INTERVAL '${3 + i} days'`),
        created_at: db.raw(`NOW() - INTERVAL '${20 + i} days'`),
        updated_at: db.raw(`NOW() - INTERVAL '${3 + i} days'`),
      })
      ids.push(id)
    }
    this.logger.info(`  ✓ ${seeds.length} observations created`)
    return ids
  }

  // ────────────────────────────────────────────────────────────────
  // 10. attachments
  // ────────────────────────────────────────────────────────────────
  private async seedAttachments(observationIds: string[], appUserIds: string[], deviceIds: string[]): Promise<void> {
    this.logger.info('[10/18] Seeding attachments...')
    const seeds = [
      { obsIdx: 0, caption: 'Teff field at flowering stage', fileType: 'image/jpeg', fileSize: 2048576 },
      { obsIdx: 1, caption: 'Early pest damage on leaves', fileType: 'image/jpeg', fileSize: 1523000 },
      { obsIdx: 2, caption: 'Sorghum heads forming', fileType: 'image/png', fileSize: 3120000 },
      { obsIdx: 3, caption: 'Maize irrigation system', fileType: 'image/jpeg', fileSize: 1845000 },
      { obsIdx: 4, caption: 'Barley field overview', fileType: 'image/jpeg', fileSize: 2510000 },
      { obsIdx: 5, caption: 'Wheat crop health assessment', fileType: 'image/png', fileSize: 1876500 },
      { obsIdx: 6, caption: 'Coffee cherry harvesting', fileType: 'image/jpeg', fileSize: 3620000 },
      { obsIdx: 7, caption: 'Enset plant pseudostem', fileType: 'image/jpeg', fileSize: 1450000 },
      { obsIdx: 9, caption: 'Coffee shade management', fileType: 'image/jpeg', fileSize: 2210000 },
      { obsIdx: 10, caption: 'Irrigation canal maintenance', fileType: 'image/jpeg', fileSize: 1685000 },
    ]
    for (let i = 0; i < seeds.length; i++) {
      const s = seeds[i]
      if (s.obsIdx >= observationIds.length) continue
      await db.table('attachments').insert({
        id: randomUUID(),
        observation_id: observationIds[s.obsIdx],
        file_url: `https://storage.example.com/uploads/${randomUUID()}.${s.fileType === 'image/png' ? 'png' : 'jpg'}`,
        file_type: s.fileType,
        file_size_bytes: s.fileSize,
        caption: s.caption,
        uploaded_by: appUserIds[i % appUserIds.length],
        device_id: deviceIds[i % deviceIds.length],
        client_created_at: db.raw(`NOW() - INTERVAL '${15 + i} days'`),
        created_at: db.raw(`NOW() - INTERVAL '${15 + i} days'`),
      })
    }
    this.logger.info(`  ✓ ${seeds.length} attachments created`)
  }

  // ────────────────────────────────────────────────────────────────
  // 11. sync_queue
  // ────────────────────────────────────────────────────────────────
  private async seedSyncQueue(deviceIds: string[], appUserIds: string[]): Promise<void> {
    this.logger.info('[11/18] Seeding sync queue...')
    const entityTypes = ['farmer', 'plot', 'observation', 'attachment'] as const
    const operations = ['CREATE', 'UPDATE'] as const
    const statuses = ['completed', 'completed', 'completed', 'completed', 'completed', 'completed', 'completed', 'completed', 'completed', 'pending'] as const
    for (let i = 0; i < 10; i++) {
      const deviceIdx = i % deviceIds.length
      const userIdx = i % appUserIds.length
      await db.table('sync_queue').insert({
        id: randomUUID(),
        device_id: deviceIds[deviceIdx],
        user_id: appUserIds[userIdx],
        batch_id: randomUUID(),
        entity_type: entityTypes[i % entityTypes.length],
        entity_id: randomUUID(),
        operation: operations[i % operations.length],
        payload: db.raw(`'{"synced":true,"source":"mobile_v2.${i}"}'::jsonb`),
        client_timestamp: db.raw(`NOW() - INTERVAL '${10 + i * 2} hours'`),
        status: statuses[i],
        retry_count: 0,
        server_timestamp: db.raw(`NOW() - INTERVAL '${10 + i * 2} hours'`),
        created_at: db.raw(`NOW() - INTERVAL '${10 + i * 2} hours'`),
        processed_at: statuses[i] === 'completed' ? db.raw(`NOW() - INTERVAL '${9 + i * 2} hours'`) : null,
      })
    }
    this.logger.info('  ✓ 10 sync queue entries created')
  }

  // ────────────────────────────────────────────────────────────────
  // 12. audit_logs
  // ────────────────────────────────────────────────────────────────
  private async seedAuditLogs(appUserIds: string[]): Promise<void> {
    this.logger.info('[12/18] Seeding audit logs...')
    const actions = ['INSERT', 'UPDATE', 'DELETE', 'SYNC', 'IMPORT', 'PREDICT', 'QUERY', 'EXPORT', 'PAYMENT']
    const tables = ['farmers', 'plots', 'observations', 'app_users', 'import_jobs', 'predictions']
    for (let i = 0; i < 12; i++) {
      await db.table('audit_logs').insert({
        id: randomUUID(),
        user_id: appUserIds[i % appUserIds.length],
        table_name: tables[i % tables.length],
        record_id: randomUUID(),
        action: actions[i % actions.length],
        old_values: db.raw("'{}'::jsonb"),
        new_values: db.raw(`'{"seeded":true,"sequence":${i}}'::jsonb`),
        ip_address: i % 2 === 0 ? '196.188.12.34' : '10.0.0.1',
        user_agent: 'Mozilla/5.0 IADS Mobile v2.0',
        created_at: db.raw(`NOW() - INTERVAL '${15 - i} days'`),
      })
    }
    this.logger.info('  ✓ 12 audit logs created')
  }

  // ────────────────────────────────────────────────────────────────
  // 13. import_jobs
  // ────────────────────────────────────────────────────────────────
  private async seedImportJobs(appUserIds: string[], _userIds: number[]): Promise<string[]> {
    this.logger.info('[13/18] Seeding import jobs...')
    const seeds: { fileName: string; fileType: string; fileSize: number; status: string; totalRows: number; importedRows: number; skippedRows: number }[] = [
      { fileName: 'teff_harvest_2025.csv', fileType: 'csv', fileSize: 245000, status: 'completed', totalRows: 500, importedRows: 490, skippedRows: 10 },
      { fileName: 'wheat_yield_data.xlsx', fileType: 'xlsx', fileSize: 520000, status: 'completed', totalRows: 1200, importedRows: 1185, skippedRows: 15 },
      { fileName: 'coffee_farmers_export.csv', fileType: 'csv', fileSize: 180000, status: 'completed', totalRows: 350, importedRows: 348, skippedRows: 2 },
      { fileName: 'rainfall_data_2024.xlsx', fileType: 'xlsx', fileSize: 890000, status: 'completed', totalRows: 2000, importedRows: 1990, skippedRows: 10 },
      { fileName: 'pending_import_season.csv', fileType: 'csv', fileSize: 120000, status: 'processing', totalRows: 280, importedRows: 150, skippedRows: 5 },
    ]
    const ids: string[] = []
    for (let i = 0; i < seeds.length; i++) {
      const s = seeds[i]
      const id = randomUUID()
      await db.table('import_jobs').insert({
        id,
        created_by: appUserIds[i % appUserIds.length],
        file_name: s.fileName,
        file_type: s.fileType,
        file_size_bytes: s.fileSize,
        status: s.status,
        total_rows: s.totalRows,
        imported_rows: s.importedRows,
        skipped_rows: s.skippedRows,
        schema_mapping: s.fileType === 'csv' ? db.raw(`'{"crop":"crop_name","yield":"actual_yield_kg","area":"area_hectares"}'::jsonb`) : null,
        started_at: s.status !== 'pending' ? db.raw(`NOW() - INTERVAL '${15 - i} days'`) : null,
        completed_at: s.status === 'completed' ? db.raw(`NOW() - INTERVAL '${15 - i} days'`) : null,
        created_at: db.raw(`NOW() - INTERVAL '${16 - i} days'`),
        updated_at: db.raw(`NOW() - INTERVAL '${15 - i} days'`),
      })
      ids.push(id)
    }
    this.logger.info(`  ✓ ${seeds.length} import jobs created`)
    return ids
  }

  // ────────────────────────────────────────────────────────────────
  // 14. imported_records
  // ────────────────────────────────────────────────────────────────
  private async seedImportedRecords(importJobIds: string[]): Promise<void> {
    this.logger.info('[14/18] Seeding imported records...')
    const regions = ['Tigray', 'Amhara', 'Oromia', 'SNNPR', 'Sidama', 'Somali']
    const crops = ['Teff', 'Wheat', 'Maize', 'Sorghum', 'Barley', 'Coffee']
    const categories = ['cereal', 'cereal', 'cereal', 'cereal', 'cereal', 'cash_crop']
    const seasons = ['meher', 'belg', 'meher', 'meher', 'belg', 'meher']
    for (let i = 0; i < 12; i++) {
      const cropIdx = i % crops.length
      await db.table('imported_records').insert({
        id: randomUUID(),
        import_job_id: importJobIds[i % importJobIds.length],
        source_row: i + 1,
        kebele: `Kebele ${String.fromCharCode(65 + (i % 6))}`,
        region: regions[i % regions.length],
        crop_name: crops[cropIdx],
        crop_category: categories[cropIdx],
        area_hectares: Math.round((1 + Math.random() * 4) * 100) / 100,
        expected_yield_kg: Math.round((3000 + Math.random() * 5000)),
        actual_yield_kg: i % 3 === 0 ? null : Math.round((2500 + Math.random() * 5500)),
        rainfall_mm: Math.round((400 + Math.random() * 800) * 100) / 100,
        temperature_celsius: Math.round((18 + Math.random() * 10) * 10) / 10,
        season: seasons[i % seasons.length],
        year: [2024, 2025][i % 2],
        planting_date: `2024-0${(i % 6) + 1}-15`,
        harvest_date: `2024-0${((i % 6) + 2) % 12 + 1}-${10 + (i % 20)}`,
        fertilizer_type: i % 2 === 0 ? 'Urea' : 'DAP',
        fertilizer_amount_kg: Math.round((50 + Math.random() * 150) * 100) / 100,
        pesticide_used: i % 3 === 0 ? 'None' : 'Roundup',
        irrigation_type: i % 4 === 0 ? 'furrow' : 'rainfed',
        soil_type: ['Vertisol', 'Nitosol', 'Cambisol'][i % 3],
        raw_values: db.raw(`'{"original_row":${i + 1},"source":"csv_import"}'::jsonb`),
        status: i % 2 === 0 ? 'valid' : 'valid',
        created_at: db.raw(`NOW() - INTERVAL '${14 - i} days'`),
      })
    }
    this.logger.info('  ✓ 12 imported records created')
  }

  // ────────────────────────────────────────────────────────────────
  // 15. dataset_permissions
  // ────────────────────────────────────────────────────────────────
  private async seedDatasetPermissions(appUserIds: string[]): Promise<void> {
    this.logger.info('[15/18] Seeding dataset permissions...')
    const perms: { userIdx: number; type: string; perms: string[] }[] = [
      { userIdx: 0, type: 'observations', perms: ['read', 'write', 'delete', 'export'] },
      { userIdx: 0, type: 'imported_records', perms: ['read', 'write', 'delete', 'export'] },
      { userIdx: 0, type: 'predictions', perms: ['read', 'write', 'delete'] },
      { userIdx: 4, type: 'observations', perms: ['read', 'export'] },
      { userIdx: 5, type: 'observations', perms: ['read'] },
      { userIdx: 6, type: 'predictions', perms: ['read'] },
      { userIdx: 1, type: 'observations', perms: ['read', 'write'] },
      { userIdx: 3, type: 'imported_records', perms: ['read', 'export'] },
    ]
    for (const p of perms) {
      await db.table('dataset_permissions').insert({
        id: randomUUID(),
        user_id: appUserIds[p.userIdx % appUserIds.length],
        dataset_type: p.type,
        permissions: db.raw(`ARRAY[${p.perms.map(p => `'${p}'`).join(',')}]`),
        granted_by: appUserIds[0],
        created_at: db.raw('NOW()'),
        updated_at: db.raw('NOW()'),
      })
    }
    this.logger.info(`  ✓ ${perms.length} dataset permissions created`)
  }

  // ────────────────────────────────────────────────────────────────
  // 16. predictions
  // ────────────────────────────────────────────────────────────────
  private async seedPredictions(appUserIds: string[], importJobIds: string[]): Promise<void> {
    this.logger.info('[16/18] Seeding predictions...')
    const seeds = [
      { userIdx: 6, crop: 'Teff', area: 2.5, rain: 600, temp: 22, fert: 100, season: 'meher', year: 2025 },
      { userIdx: 6, crop: 'Wheat', area: 3.0, rain: 550, temp: 18, fert: 150, season: 'meher', year: 2025 },
      { userIdx: 4, crop: 'Maize', area: 4.0, rain: 700, temp: 24, fert: 200, season: 'belg', year: 2025 },
      { userIdx: 1, crop: 'Sorghum', area: 2.0, rain: 450, temp: 26, fert: 80, season: 'meher', year: 2025 },
      { userIdx: 5, crop: 'Barley', area: 1.5, rain: 500, temp: 16, fert: 60, season: 'belg', year: 2025 },
      { userIdx: 6, crop: 'Teff', area: 1.0, rain: 650, temp: 21, fert: 50, season: 'meher', year: 2026 },
      { userIdx: 3, crop: 'Coffee', area: 0.8, rain: 1200, temp: 20, fert: 30, season: 'meher', year: 2025 },
      { userIdx: 1, crop: 'Maize', area: 5.0, rain: 750, temp: 23, fert: 250, season: 'meher', year: 2025 },
      { userIdx: 6, crop: 'Wheat', area: 2.0, rain: 480, temp: 17, fert: 120, season: 'belg', year: 2025 },
      { userIdx: 4, crop: 'Teff', area: 3.5, rain: 520, temp: 22, fert: 130, season: 'meher', year: 2025 },
    ]
    for (let i = 0; i < seeds.length; i++) {
      const s = seeds[i]
      const features = { crop_name: s.crop, area_hectares: s.area, rainfall_mm: s.rain, temperature_celsius: s.temp, fertilizer_amount_kg: s.fert, season: s.season, year: s.year }
      await db.table('predictions').insert({
        id: randomUUID(),
        requested_by: appUserIds[s.userIdx % appUserIds.length],
        import_job_id: importJobIds[i % importJobIds.length],
        imported_record_id: null,
        model_version: '20260520_131732',
        model_type: 'yield_regression',
        input_features: db.raw(`'${JSON.stringify(features)}'::jsonb`),
        predicted_yield_kg: Math.round((2500 + Math.random() * 3000) * 100) / 100,
        confidence_score: Math.round((0.75 + Math.random() * 0.2) * 10000) / 10000,
        raw_output: db.raw(`'{"model_type":"GradientBoostingRegressor","mae_kg":2424}'::jsonb`),
        status: 'completed',
        created_at: db.raw(`NOW() - INTERVAL '${10 - i} days'`),
        updated_at: db.raw(`NOW() - INTERVAL '${10 - i} days'`),
      })
    }
    this.logger.info(`  ✓ ${seeds.length} predictions created`)
  }

  // ────────────────────────────────────────────────────────────────
  // 17. subscriptions
  // ────────────────────────────────────────────────────────────────
  private async seedSubscriptions(appUserIds: string[], productIds: string[]): Promise<void> {
    this.logger.info('[17/18] Seeding subscriptions...')
    const seeds: { userIdx: number; productIdx: number; status: string; startDaysAgo: number; expiryDaysAhead: number }[] = [
      { userIdx: 0, productIdx: 2, status: 'active', startDaysAgo: 90, expiryDaysAhead: 90 },
      { userIdx: 3, productIdx: 2, status: 'active', startDaysAgo: 45, expiryDaysAhead: 135 },
      { userIdx: 4, productIdx: 0, status: 'active', startDaysAgo: 30, expiryDaysAhead: 30 },
      { userIdx: 5, productIdx: 1, status: 'expired', startDaysAgo: 200, expiryDaysAhead: -40 },
      { userIdx: 6, productIdx: 2, status: 'active', startDaysAgo: 10, expiryDaysAhead: 170 },
      { userIdx: 1, productIdx: 3, status: 'active', startDaysAgo: 5, expiryDaysAhead: 5 },
    ]
    for (const s of seeds) {
      await db.table('subscriptions').insert({
        id: randomUUID(),
        user_id: appUserIds[s.userIdx % appUserIds.length],
        product_id: productIds[s.productIdx % productIds.length],
        status: s.status,
        starts_at: db.raw(`NOW() - INTERVAL '${s.startDaysAgo} days'`),
        expires_at: s.expiryDaysAhead > 0 ? db.raw(`NOW() + INTERVAL '${s.expiryDaysAhead} days'`) : db.raw(`NOW() - INTERVAL '${Math.abs(s.expiryDaysAhead)} days'`),
        created_at: db.raw(`NOW() - INTERVAL '${s.startDaysAgo} days'`),
        updated_at: db.raw(`NOW() - INTERVAL '${s.startDaysAgo} days'`),
      })
    }
    this.logger.info(`  ✓ ${seeds.length} subscriptions created`)
  }

  // ────────────────────────────────────────────────────────────────
  // 18. transactions
  // ────────────────────────────────────────────────────────────────
  private async seedTransactions(appUserIds: string[], productIds: string[]): Promise<void> {
    this.logger.info('[18/18] Seeding transactions...')
    const seeds: { userIdx: number; productIdx: number; amount: number; status: string; provider: string }[] = [
      { userIdx: 0, productIdx: 2, amount: 199.99, status: 'completed', provider: 'Chapa' },
      { userIdx: 3, productIdx: 2, amount: 199.99, status: 'completed', provider: 'Chapa' },
      { userIdx: 4, productIdx: 0, amount: 49.99, status: 'completed', provider: 'Chapa' },
      { userIdx: 5, productIdx: 1, amount: 99.99, status: 'completed', provider: 'PayPal' },
      { userIdx: 6, productIdx: 2, amount: 199.99, status: 'completed', provider: 'Chapa' },
      { userIdx: 1, productIdx: 3, amount: 4.99, status: 'completed', provider: 'Chapa' },
      { userIdx: 2, productIdx: 0, amount: 49.99, status: 'pending', provider: 'Chapa' },
      { userIdx: 0, productIdx: 4, amount: 299.99, status: 'completed', provider: 'Bank Transfer' },
    ]
    for (const s of seeds) {
      await db.table('transactions').insert({
        id: randomUUID(),
        user_id: appUserIds[s.userIdx % appUserIds.length],
        product_id: productIds[s.productIdx % productIds.length],
        amount_usd: s.amount,
        currency: 'USD',
        status: s.status,
        payment_provider: s.provider,
        payment_reference: `TXN-${randomUUID().slice(0, 8).toUpperCase()}`,
        payment_metadata: db.raw(`'{"method":"online","provider":"${s.provider}"}'::jsonb`),
        created_at: db.raw(`NOW() - INTERVAL '${10 + Math.floor(Math.random() * 30)} days'`),
        updated_at: db.raw(`NOW() - INTERVAL '${10 + Math.floor(Math.random() * 30)} days'`),
      })
    }
    this.logger.info(`  ✓ ${seeds.length} transactions created`)
  }

  // ────────────────────────────────────────────────────────────────
  // Helper: seed a UUID-table with idempotent check
  // ────────────────────────────────────────────────────────────────
  private async seedUuidTable(table: string, rows: any[], uniqueColumn: string): Promise<string[]> {
    const ids: string[] = []
    for (const row of rows) {
      const existing = await db.from(table).where(uniqueColumn, row[uniqueColumn]).first()
      if (existing) {
        ids.push(existing.id)
        this.logger.info(`  · ${row[uniqueColumn]} — already exists`)
        continue
      }
      await db.table(table).insert({ ...row, created_at: db.raw('NOW()'), updated_at: db.raw('NOW()') })
      ids.push(row.id)
      const label = row.fullName || row.name || row.deviceUuid || row.email || row[uniqueColumn]
      this.logger.info(`  ✓ ${label}`)
    }
    return ids
  }
}
