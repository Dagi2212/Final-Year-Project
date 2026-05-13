import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import Organization from '#models/organization'
import AuditLog from '#models/audit_log'

export default class CheckAudit extends BaseCommand {
  static commandName = 'check:audit'
  static description = 'Check if audit logs are working by creating and deleting a test record'

  static options: CommandOptions = {
    startApp: true
  }

  async run() {
    this.logger.info('Starting audit log check...')

    try {
      // 1. Check current count
      const initialCount = await AuditLog.query().count('* as total')
      this.logger.info(`Initial audit log count: ${initialCount[0].$extras.total}`)

      // 2. Create a test organization
      this.logger.info('Creating test organization...')
      const org = await Organization.create({
        name: 'Audit Test Org ' + new Date().toISOString(),
        type: 'private',
        region: 'Test'
      })
      this.logger.success(`Created organization ID: ${org.id}`)

      // 3. Verify INSERT log
      const insertLog = await AuditLog.query()
        .where('table_name', 'organizations')
        .where('record_id', org.id)
        .where('action', 'INSERT')
        .first()

      if (insertLog) {
        this.logger.success('INSERT audit log found!')
      } else {
        this.logger.error('INSERT audit log NOT found.')
      }

      // 4. Delete the organization
      this.logger.info('Deleting test organization...')
      await org.delete()
      this.logger.success('Organization deleted.')

      // 5. Verify DELETE log
      const deleteLog = await AuditLog.query()
        .where('table_name', 'organizations')
        .where('record_id', org.id)
        .where('action', 'DELETE')
        .first()

      if (deleteLog) {
        this.logger.success('DELETE audit log found!')
      } else {
        this.logger.error('DELETE audit log NOT found.')
      }

      const finalCount = await AuditLog.query().count('* as total')
      this.logger.info(`Final audit log count: ${finalCount[0].$extras.total}`)

    } catch (error) {
      this.logger.error('Error during audit check: ' + (error instanceof Error ? error.message : String(error)))
    }
  }
}