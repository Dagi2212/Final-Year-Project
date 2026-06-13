import type { AppRole } from './role-permissions'

export type DashboardSection =
  | 'summaryCards'
  | 'plotMap'
  | 'yieldChart'
  | 'farmerCountChart'
  | 'observationPie'
  | 'yieldEfficiencyRadar'
  | 'farmerGrowthChart'
  | 'yieldSummaryTable'
  | 'recentLogs'
  | 'importStats'
  | 'predictionStats'
  | 'syncStatusSection'

interface RoleDashboardConfig {
  subtitle: string
  sections: DashboardSection[]
}

export const ROLE_DASHBOARD_CONFIG: Record<AppRole, RoleDashboardConfig> = {
  admin: {
    subtitle: 'Full system overview and analytics',
    sections: [
      'summaryCards',
      'importStats',
      'predictionStats',
      'plotMap',
      'yieldChart',
      'farmerCountChart',
      'syncStatusSection',
      'observationPie',
      'yieldEfficiencyRadar',
      'farmerGrowthChart',
      'yieldSummaryTable',
      'recentLogs',
    ],
  },
  supervisor: {
    subtitle: 'Supervisory dashboard with field analytics',
    sections: [
      'summaryCards',
      'importStats',
      'predictionStats',
      'plotMap',
      'yieldChart',
      'farmerCountChart',
      'syncStatusSection',
      'observationPie',
      'yieldEfficiencyRadar',
      'farmerGrowthChart',
      'yieldSummaryTable',
      'recentLogs',
    ],
  },
  field_agent: {
    subtitle: 'Your field data and sync overview',
    sections: [
      'summaryCards',
      'syncStatusSection',
      'plotMap',
      'farmerCountChart',
      'observationPie',
    ],
  },
  gov: {
    subtitle: 'Regional agricultural statistics and trends',
    sections: [
      'summaryCards',
      'farmerCountChart',
      'farmerGrowthChart',
      'yieldChart',
      'yieldEfficiencyRadar',
      'plotMap',
      'yieldSummaryTable',
      'observationPie',
    ],
  },
  ngo: {
    subtitle: 'Development metrics and program insights',
    sections: [
      'summaryCards',
      'farmerCountChart',
      'farmerGrowthChart',
      'yieldChart',
      'yieldEfficiencyRadar',
      'importStats',
      'predictionStats',
      'syncStatusSection',
      'plotMap',
      'yieldSummaryTable',
      'observationPie',
    ],
  },
  trader: {
    subtitle: 'Market intelligence and yield data',
    sections: [
      'summaryCards',
      'yieldChart',
      'yieldEfficiencyRadar',
      'plotMap',
      'yieldSummaryTable',
    ],
  },
  researcher: {
    subtitle: 'Research data, predictions, and analysis',
    sections: [
      'summaryCards',
      'yieldChart',
      'yieldEfficiencyRadar',
      'predictionStats',
      'importStats',
      'farmerCountChart',
      'farmerGrowthChart',
      'plotMap',
      'yieldSummaryTable',
      'observationPie',
      'syncStatusSection',
    ],
  },
}

export function getDashboardConfig(role: string | undefined | null): RoleDashboardConfig {
  if (role && role in ROLE_DASHBOARD_CONFIG) {
    return ROLE_DASHBOARD_CONFIG[role as AppRole]
  }
  return {
    subtitle: 'Farm overview',
    sections: ['summaryCards', 'plotMap'],
  }
}
