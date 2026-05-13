/**
 * Application role definitions.
 *
 * Roles are additive: each role below is listed alongside the broad set
 * of capabilities it is expected to exercise in the system.
 */

export const ROLES = {
  /** Full system administration */
  ADMIN: 'admin',
  /** Field data-collection agent */
  FIELD_AGENT: 'field_agent',
  /** Supervisor over a group of field agents */
  SUPERVISOR: 'supervisor',
  /** Government / public-sector stakeholder */
  GOV: 'gov',
  /** Non-governmental organisation */
  NGO: 'ngo',
  /** Commodity trader / wholesaler */
  TRADER: 'trader',
  /** Research / academic user */
  RESEARCHER: 'researcher',
} as const

export type AppRole = (typeof ROLES)[keyof typeof ROLES]

/**
 * Role hierarchy: roles that are considered "privileged" and can manage
 * data on behalf of others.
 */
export const PRIVILEGED_ROLES: AppRole[] = [ROLES.ADMIN, ROLES.SUPERVISOR]

/**
 * Roles allowed to access aggregated / analytical endpoints.
 */
export const ANALYTICS_ROLES: AppRole[] = [
  ROLES.ADMIN,
  ROLES.SUPERVISOR,
  ROLES.GOV,
  ROLES.NGO,
  ROLES.TRADER,
  ROLES.RESEARCHER,
]

/**
 * Roles allowed to trigger ML predictions.
 */
export const PREDICTION_ROLES: AppRole[] = [
  ROLES.ADMIN,
  ROLES.SUPERVISOR,
  ROLES.RESEARCHER,
  ROLES.NGO,
]

/**
 * Roles allowed to upload / import data files.
 */
export const IMPORT_ROLES: AppRole[] = [ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.FIELD_AGENT]

/**
 * Roles allowed to query the RAG/intelligent-query endpoint.
 */
export const QUERY_ROLES: AppRole[] = [
  ROLES.ADMIN,
  ROLES.SUPERVISOR,
  ROLES.GOV,
  ROLES.NGO,
  ROLES.RESEARCHER,
]
