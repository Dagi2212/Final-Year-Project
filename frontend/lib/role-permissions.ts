export const ROLES = {
  ADMIN: 'admin',
  FIELD_AGENT: 'field_agent',
  SUPERVISOR: 'supervisor',
  GOV: 'gov',
  NGO: 'ngo',
  TRADER: 'trader',
  RESEARCHER: 'researcher',
} as const

export type AppRole = (typeof ROLES)[keyof typeof ROLES]

export const PRIVILEGED_ROLES: AppRole[] = [ROLES.ADMIN, ROLES.SUPERVISOR]
export const ANALYTICS_ROLES: AppRole[] = [
  ROLES.ADMIN,
  ROLES.SUPERVISOR,
  ROLES.GOV,
  ROLES.NGO,
  ROLES.TRADER,
  ROLES.RESEARCHER,
]
export const PREDICTION_ROLES: AppRole[] = [
  ROLES.ADMIN,
  ROLES.SUPERVISOR,
  ROLES.RESEARCHER,
  ROLES.NGO,
]
export const IMPORT_ROLES: AppRole[] = [ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.FIELD_AGENT]
export const QUERY_ROLES: AppRole[] = [
  ROLES.ADMIN,
  ROLES.SUPERVISOR,
  ROLES.GOV,
  ROLES.NGO,
  ROLES.RESEARCHER,
]

const ALL_ROLES: AppRole[] = [
  ROLES.ADMIN,
  ROLES.FIELD_AGENT,
  ROLES.SUPERVISOR,
  ROLES.GOV,
  ROLES.NGO,
  ROLES.TRADER,
  ROLES.RESEARCHER,
]

export const PAGE_ACCESS: Record<string, AppRole[]> = {
  '/dashboard': ALL_ROLES,
  '/dashboard/farmers': ALL_ROLES,
  '/dashboard/plots': ALL_ROLES,
  '/dashboard/observations': ALL_ROLES,
  '/dashboard/crop-types': ALL_ROLES,
  '/dashboard/ai-query': QUERY_ROLES,
  '/dashboard/predictions': PREDICTION_ROLES,
  '/dashboard/imports': IMPORT_ROLES,
  '/dashboard/organizations': ALL_ROLES,
  '/dashboard/users': [ROLES.ADMIN],
  '/dashboard/devices': ALL_ROLES,
  '/dashboard/sync-queue': ALL_ROLES,
  '/dashboard/audit-logs': PRIVILEGED_ROLES,
  '/dashboard/settings': ALL_ROLES,
}

export function hasRoleAccess(role: string | undefined | null, pathname: string): boolean {
  if (!role) return false

  const exact = PAGE_ACCESS[pathname]
  if (exact) return exact.includes(role as AppRole)

  for (const [page, roles] of Object.entries(PAGE_ACCESS)) {
    if (pathname.startsWith(page + '/')) {
      return roles.includes(role as AppRole)
    }
  }

  return false
}
