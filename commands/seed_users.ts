import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import hash from '@adonisjs/core/services/hash'
import db from '@adonisjs/lucid/services/db'

export default class SeedUsers extends BaseCommand {
  static commandName = 'seed:users'
  static description = 'Create one user for each role with known credentials'

  static options: CommandOptions = {
    startApp: true,
  }

  private readonly PASSWORD = 'password123'

  private readonly SEED_USERS = [
    { email: 'admin@example.com', fullName: 'Admin User', role: 'admin' },
    { email: 'field_agent@example.com', fullName: 'Field Agent User', role: 'field_agent' },
    { email: 'supervisor@example.com', fullName: 'Supervisor User', role: 'supervisor' },
    { email: 'gov@example.com', fullName: 'Government User', role: 'gov' },
    { email: 'ngo@example.com', fullName: 'NGO User', role: 'ngo' },
    { email: 'trader@example.com', fullName: 'Trader User', role: 'trader' },
    { email: 'researcher@example.com', fullName: 'Researcher User', role: 'researcher' },
  ]

  async run() {
    this.logger.info('Seeding users for all roles...\n')

    const passwordHash = await hash.make(this.PASSWORD)

    const results: { email: string; password: string; role: string; status: string }[] = []

    for (const seed of this.SEED_USERS) {
      try {
        const existingUser = await db.from('users').where('email', seed.email).first()
        if (existingUser) {
          results.push({ email: seed.email, password: this.PASSWORD, role: seed.role, status: 'already exists' })
          continue
        }

        await db.table('users').insert({
          full_name: seed.fullName,
          email: seed.email,
          password: passwordHash,
          created_at: db.raw('NOW()'),
          updated_at: db.raw('NOW()'),
        })

        const existingAppUser = await db.from('app_users').where('email', seed.email).first()
        if (!existingAppUser) {
          await db.table('app_users').insert({
            email: seed.email,
            full_name: seed.fullName,
            role: seed.role,
            is_active: true,
          })
        }

        results.push({ email: seed.email, password: this.PASSWORD, role: seed.role, status: 'created' })
        this.logger.success(`  ✓ ${seed.email} (${seed.role})`)
      } catch (error: any) {
        results.push({ email: seed.email, password: this.PASSWORD, role: seed.role, status: `error: ${error.message}` })
        this.logger.error(`  ✗ ${seed.email}: ${error.message}`)
      }
    }

    this.logger.info('\n ─────────────────────────────────────────────────────────────')
    this.logger.info('  Seed Users Summary')
    this.logger.info(' ─────────────────────────────────────────────────────────────')
    this.logger.info(`  ${'Email'.padEnd(32)} ${'Password'.padEnd(16)} ${'Role'.padEnd(16)} Status`)
    this.logger.info('  ' + '─'.repeat(80))
    for (const r of results) {
      this.logger.info(`  ${r.email.padEnd(32)} ${r.password.padEnd(16)} ${r.role.padEnd(16)} ${r.status}`)
    }
    this.logger.info(' ─────────────────────────────────────────────────────────────')
    this.logger.info('')
    this.logger.info('  Login at: http://localhost:3000/login')
    this.logger.info('')
  }
}
