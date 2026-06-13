'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { DashboardIndexResponse, Plot } from '@/lib/types';
import { getDashboardConfig } from '@/lib/dashboard-config';
import type { DashboardSection } from '@/lib/dashboard-config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const PlotMap = dynamic(() => import('@/components/plot-map'), { ssr: false });
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Eye,
  MapPin,
  Users,
  Wheat,
  FileSpreadsheet,
  TrendingUp,
  RefreshCw,
  Database,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

const SYNC_ROLES = ['admin', 'supervisor', 'field_agent', 'gov', 'ngo', 'researcher']

function SectionRenderer({
  section,
  data,
  plots,
  role,
}: {
  section: DashboardSection
  data: DashboardIndexResponse | null
  plots: Plot[]
  role: string | undefined
}) {
  const summary = data?.summary
  const yieldSummary = data?.yieldSummary || []
  const totalFarmers = summary?.totalFarmers || 0
  const totalPlots = summary?.totalPlots || 0
  const totalExpectedYieldKg = summary?.totalExpectedYieldKg || 0
  const totalActualYieldKg = summary?.totalActualYieldKg || 0
  const pendingSyncs = summary?.pendingSyncs ?? 0
  const totalObservations = yieldSummary.reduce((s, i) => s + Number(i.observation_count || 0), 0)
  const yieldPerformancePct = totalExpectedYieldKg > 0 ? (totalActualYieldKg / totalExpectedYieldKg) * 100 : 0

  const hasSyncAccess = role ? SYNC_ROLES.includes(role) : false

  const yieldChartData = yieldSummary.slice(0, 10).map(item => {
    const expected = Number(item.avg_expected_yield_kg || 0)
    const actual = Number(item.avg_actual_yield_kg || 0)
    const efficiency = expected > 0 ? (actual / expected) * 100 : 0
    return {
      crop: item.crop_name || 'Unknown',
      expected,
      actual,
      observations: Number(item.observation_count || 0),
      efficiency: Math.min(200, Number(efficiency.toFixed(1))),
    }
  })

  const farmerChartData = (data?.farmerCounts || []).slice(0, 8).map(item => ({
    name: item.organization_name || 'Unknown',
    total: Number(item.farmer_count) || 0,
    new30d: Number(item.new_farmers_30d) || 0,
  }))

  const observationShareData = yieldChartData
    .map(item => ({ name: item.crop, value: item.observations }))
    .filter(item => item.value > 0)

  const COLORS = ['#16a34a', '#0ea5e9', '#f97316', '#a855f7', '#eab308', '#14b8a6']

  const importStats = data?.importStats
  const predictionStats = data?.predictionStats

  switch (section) {
    case 'summaryCards':
      return (
        <div className={cn(
          "grid grid-cols-1 md:grid-cols-2 gap-4 mb-8",
          hasSyncAccess ? "lg:grid-cols-5" : "lg:grid-cols-4"
        )}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Farmers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalFarmers}</div>
              <p className="text-xs text-muted-foreground mt-1">Active farmers in your organization</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Plots</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPlots}</div>
              <p className="text-xs text-muted-foreground mt-1">Agricultural plots tracked</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Observations</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalObservations}</div>
              <p className="text-xs text-muted-foreground mt-1">Field observations recorded</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Yield Performance</CardTitle>
              <Wheat className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{yieldPerformancePct.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Actual vs expected yield ({totalActualYieldKg.toFixed(1)}kg / {totalExpectedYieldKg.toFixed(1)}kg)
            </p>
          </CardContent>
        </Card>

        {hasSyncAccess && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Syncs</CardTitle>
              <RefreshCw className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingSyncs}</div>
              <p className="text-xs text-muted-foreground mt-1">Data items awaiting sync</p>
            </CardContent>
          </Card>
        )}
      </div>
      )

    case 'plotMap':
      return (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Plot Locations ({plots.filter(p => p.latitude && p.longitude).length} mapped)</CardTitle>
          </CardHeader>
          <CardContent>
            <PlotMap mode="display" plots={plots} height="h-80" />
          </CardContent>
        </Card>
      )

    case 'yieldChart':
      return (
        <Card>
          <CardHeader>
            <CardTitle>Yield by Crop (Expected vs Actual)</CardTitle>
          </CardHeader>
          <CardContent>
            {yieldChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={yieldChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="crop" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="expected" name="Expected" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.25} />
                  <Area type="monotone" dataKey="actual" name="Actual" stroke="#16a34a" fill="#16a34a" fillOpacity={0.25} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-12">No yield data available</p>
            )}
          </CardContent>
        </Card>
      )

    case 'farmerCountChart':
      return (
        <Card>
          <CardHeader>
            <CardTitle>Farmer Counts by Organization</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={farmerChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" name="Total" fill="#3b82f6" />
                <Bar dataKey="new30d" name="New (30d)" fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )

    case 'observationPie':
      return (
        <Card>
          <CardHeader>
            <CardTitle>Observation Share by Crop</CardTitle>
          </CardHeader>
          <CardContent>
            {observationShareData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={observationShareData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={90}
                    dataKey="value"
                  >
                    {observationShareData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-12">No observation data available</p>
            )}
          </CardContent>
        </Card>
      )

    case 'yieldEfficiencyRadar':
      return (
        <Card>
          <CardHeader>
            <CardTitle>Yield Efficiency by Crop</CardTitle>
          </CardHeader>
          <CardContent>
            {yieldChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={yieldChartData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="crop" />
                  <PolarRadiusAxis angle={30} domain={[0, 200]} />
                  <Radar name="Efficiency" dataKey="efficiency" stroke="#16a34a" fill="#16a34a" fillOpacity={0.3} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-12">No yield data available</p>
            )}
          </CardContent>
        </Card>
      )

    case 'farmerGrowthChart':
      return (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Farmer Growth Signals</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={farmerChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total" name="Total Farmers" stroke="#0ea5e9" strokeWidth={2} />
                <Line type="monotone" dataKey="new30d" name="New (30d)" stroke="#f97316" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )

    case 'yieldSummaryTable':
      return (
        <Card>
          <CardHeader>
            <CardTitle>Yield Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {yieldSummary.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">Crop Type</th>
                      <th className="text-right py-2 px-4">Observations</th>
                      <th className="text-right py-2 px-4">Avg Expected Yield (kg)</th>
                      <th className="text-right py-2 px-4">Avg Actual Yield (kg)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yieldSummary.map((item, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="py-2 px-4">
                          <div>{item.crop_name}</div>
                          <div className="text-xs text-muted-foreground">{item.local_name}</div>
                        </td>
                        <td className="text-right py-2 px-4">{item.observation_count || 0}</td>
                        <td className="text-right py-2 px-4">
                          {item.avg_expected_yield_kg ? Number(item.avg_expected_yield_kg).toFixed(2) : '-'}
                        </td>
                        <td className="text-right py-2 px-4">
                          {item.avg_actual_yield_kg ? Number(item.avg_actual_yield_kg).toFixed(2) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No yield data available</p>
            )}
          </CardContent>
        </Card>
      )

    case 'recentLogs':
      return (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Activity Logs</CardTitle>
          </CardHeader>
          <CardContent>
            {(data?.recentLogs && data.recentLogs.length > 0) ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">Action</th>
                      <th className="text-left py-2 px-4">Table</th>
                      <th className="text-left py-2 px-4">User</th>
                      <th className="text-left py-2 px-4">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentLogs.map((log) => (
                      <tr key={log.id} className="border-b text-sm">
                        <td className="py-2 px-4 font-medium">{log.action}</td>
                        <td className="py-2 px-4 text-muted-foreground">{log.table_name}</td>
                        <td className="py-2 px-4">{log.userName}</td>
                        <td className="py-2 px-4 text-muted-foreground">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No recent logs available</p>
            )}
          </CardContent>
        </Card>
      )

    case 'importStats':
      if (!importStats) return null
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Import Jobs</CardTitle>
              <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{importStats.totalJobs}</div>
              <p className="text-xs text-muted-foreground mt-1">Data import batches created</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{importStats.completedJobs}</div>
              <p className="text-xs text-muted-foreground mt-1">Successfully processed</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <XCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{importStats.failedJobs}</div>
              <p className="text-xs text-muted-foreground mt-1">Jobs with errors</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Imported Rows</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{importStats.totalImportedRows.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Total records imported</p>
            </CardContent>
          </Card>
        </div>
      )

    case 'predictionStats':
      if (!predictionStats) return null
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Predictions</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{predictionStats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">ML yield predictions run</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{predictionStats.completed}</div>
              <p className="text-xs text-muted-foreground mt-1">Successfully generated</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Predicted Yield</CardTitle>
              <Wheat className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {predictionStats.avgPredictedYieldKg !== null
                  ? `${Number(predictionStats.avgPredictedYieldKg).toFixed(1)}kg`
                  : '-'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Average predicted per prediction</p>
            </CardContent>
          </Card>
        </div>
      )

    case 'syncStatusSection':
      return (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Sync Status</CardTitle>
          </CardHeader>
          <CardContent>
            {(data?.syncStatus && data.syncStatus.length > 0) ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">Device</th>
                      <th className="text-right py-2 px-4">Pending</th>
                      <th className="text-right py-2 px-4">Failed</th>
                      <th className="text-right py-2 px-4">Conflicts</th>
                      <th className="text-right py-2 px-4">Last Sync</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.syncStatus.map((item) => (
                      <tr key={item.device_id} className="border-b text-sm">
                        <td className="py-2 px-4 font-medium">{item.agent_name || item.device_uuid}</td>
                        <td className="text-right py-2 px-4">
                          <span className={Number(item.pending_count) > 0 ? 'text-amber-500 font-medium' : ''}>
                            {item.pending_count || 0}
                          </span>
                        </td>
                        <td className="text-right py-2 px-4">
                          <span className={Number(item.failed_count) > 0 ? 'text-destructive font-medium' : ''}>
                            {item.failed_count || 0}
                          </span>
                        </td>
                        <td className="text-right py-2 px-4">
                          <span className={Number(item.conflict_count) > 0 ? 'text-orange-500 font-medium' : ''}>
                            {item.conflict_count || 0}
                          </span>
                        </td>
                        <td className="text-right py-2 px-4 text-muted-foreground">
                          {item.last_sync ? new Date(item.last_sync).toLocaleString() : 'Never'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex items-center gap-3 py-4 text-muted-foreground">
                <RefreshCw className="w-5 h-5" />
                <span>No sync data available</span>
              </div>
            )}
          </CardContent>
        </Card>
      )

    default:
      return null
  }
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState<DashboardIndexResponse | null>(null)
  const [plots, setPlots] = useState<Plot[]>([])
  const [loading, setLoading] = useState(true)

  const config = getDashboardConfig(user?.role)

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const [data, plotsRes] = await Promise.all([
          apiClient.get<DashboardIndexResponse>('/dashboard'),
          apiClient.get<{ meta: any; data: Plot[] }>('/plots?limit=500'),
        ])
        setDashboardData(data)
        setPlots(plotsRes.data)
      } catch (error: any) {
        console.log('[v0] Error fetching dashboard stats:', error)
        toast.error('Failed to load dashboard stats')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    )
  }

  const leftCol: DashboardSection[] = []
  const rightCol: DashboardSection[] = []
  const fullWidth: DashboardSection[] = []

  config.sections.forEach((s) => {
    if (['summaryCards', 'importStats', 'predictionStats', 'plotMap', 'farmerGrowthChart', 'recentLogs', 'syncStatusSection', 'yieldSummaryTable'].includes(s)) {
      fullWidth.push(s)
    } else {
      if (leftCol.length <= rightCol.length) leftCol.push(s)
      else rightCol.push(s)
    }
  })

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">{config.subtitle}</p>
      </div>

      {fullWidth.map((section) => (
        <SectionRenderer key={section} section={section} data={dashboardData} plots={plots} role={user?.role} />
      ))}

      {leftCol.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="space-y-8">
            {leftCol.map((section) => (
              <SectionRenderer key={section} section={section} data={dashboardData} plots={plots} role={user?.role} />
            ))}
          </div>
          <div className="space-y-8">
            {rightCol.map((section) => (
              <SectionRenderer key={section} section={section} data={dashboardData} plots={plots} role={user?.role} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
