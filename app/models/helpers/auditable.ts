import { HttpContext } from '@adonisjs/core/http'
import AuditLog from '#models/audit_log'
import { BaseModel } from '@adonisjs/lucid/orm'
import { NormalizeConstructor } from '@adonisjs/core/types/helpers'

export function Auditable<T extends NormalizeConstructor<typeof BaseModel>>(Base: T) {
  return class extends Base {
    public static boot() {
      if (this.booted) {
        return
      }
      super.boot()

      const Model = this as any

      Model.after('create', async (modelInstance: any) => {
        await this.recordAudit(modelInstance, 'INSERT')
      })

      Model.after('update', async (modelInstance: any) => {
        await this.recordAudit(modelInstance, 'UPDATE')
      })

      Model.after('delete', async (modelInstance: any) => {
        await this.recordAudit(modelInstance, 'DELETE')
      })
    }

    private static async recordAudit(modelInstance: any, action: 'INSERT' | 'UPDATE' | 'DELETE') {
      const ctx = HttpContext.get()
      const user = ctx?.auth?.user
      
      const oldValues = action === 'UPDATE' ? modelInstance.$original : null
      const newValues = action === 'DELETE' ? null : modelInstance.toJSON()

      // Remove sensitive fields
      if (newValues) {
        delete (newValues as any).password
        delete (newValues as any).passwordHash
      }
      if (oldValues) {
        delete (oldValues as any).password
        delete (oldValues as any).passwordHash
      }

      await AuditLog.create({
        userId: user?.id ? String(user.id) : null,
        tableName: (modelInstance.constructor as any).table,
        recordId: String(modelInstance.$primaryKeyValue),
        action,
        oldValues: oldValues as Record<string, any>,
        newValues: newValues as Record<string, any>,
        ipAddress: ctx?.request.ip() || null,
        userAgent: ctx?.request.header('user-agent') || null,
      })
    }
  }
}
