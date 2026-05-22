import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type { AppRole } from '#services/role_constants'
import AppUser from '#models/app_user'

/** Minimal shape of the authenticated user that this middleware cares about. */
interface AuthenticatedUser {
  id: string | number
  email?: string | null
  role?: string | null
}

/**
 * Role-guard middleware.
 *
 * Usage in routes.ts:
 *   .use(middleware.roleGuard(['admin', 'supervisor']))
 */
export default class RoleGuardMiddleware {
  async handle(
    { auth, response }: HttpContext,
    next: NextFn,
    options: { roles?: AppRole[] } = {}
  ) {
    const user = auth.user as AuthenticatedUser | null

    if (!user) {
      return response.unauthorized({ error: 'Authentication required' })
    }

    const allowedRoles = options.roles ?? []

    // If no roles specified, any authenticated user passes
    if (allowedRoles.length === 0) {
      return next()
    }

    let userRole: string = user.role ?? ''

    if (!userRole && user.email) {
      let appUser = await AppUser.query().where('email', user.email).first()
      if (!appUser) {
        appUser = await AppUser.create({
          email: user.email,
          fullName: (user as any).fullName ?? user.email,
          role: 'researcher',
          isActive: true,
        })
      }
      userRole = appUser?.role ?? 'researcher'
    }

    // Default to researcher for authenticated users without an explicit role mapping
    if (!userRole) {
      userRole = 'researcher'
    }

    if (!allowedRoles.includes(userRole as AppRole)) {
      return response.forbidden({
        error: 'You do not have permission to perform this action',
        required: allowedRoles,
        current: userRole,
      })
    }

    return next()
  }
}
