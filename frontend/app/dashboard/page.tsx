'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { apiClient } from '@/lib/api-client';
import { DashboardIndexResponse, Plot } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
import { Eye, MapPin, Users, Wheat } from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardIndexResponse | null>(null);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const [data, plotsRes] = await Promise.all([
          apiClient.get<DashboardIndexResponse>('/dashboard'),
          apiClient.get<{ meta: any; data: Plot[] }>('/plots?limit=500'),
        ]);
        setDashboardData(data);
        setPlots(plotsRes.data);
      } catch (error: any) {
        console.log('[v0] Error fetching dashboard stats:', error);
        toast.error('Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const totalFarmers = dashboardData?.summary?.totalFarmers || 0;
  const totalPlots = dashboardData?.summary?.totalPlots || 0;
  const totalExpectedYieldKg = dashboardData?.summary?.totalExpectedYieldKg || 0;
  const totalActualYieldKg = dashboardData?.summary?.totalActualYieldKg || 0;

  const yieldSummary = dashboardData?.yieldSummary || [];
  const totalObservations = yieldSummary.reduce(
    (sum, item) => sum + Number(item.observation_count || 0),
    0,
  );

  const yieldPerformancePct =
    totalExpectedYieldKg > 0
      ? (totalActualYieldKg / totalExpectedYieldKg) * 100
      : 0;

  const yieldChartData = yieldSummary.slice(0, 10).map(item => {
    const expected = Number(item.avg_expected_yield_kg || 0);
    const actual = Number(item.avg_actual_yield_kg || 0);
    const efficiency = expected > 0 ? (actual / expected) * 100 : 0;
    return {
      crop: item.crop_name || 'Unknown',
      expected,
      actual,
      observations: Number(item.observation_count || 0),
      efficiency: Math.min(200, Number(efficiency.toFixed(1))),
    };
  });

  const farmerChartData = (dashboardData?.farmerCounts || [])
    .slice(0, 8)
    .map(item => ({
      name: item.organization_name || 'Unknown',
      total: Number(item.farmer_count) || 0,
      new30d: Number(item.new_farmers_30d) || 0,
    }));

  const observationShareData = yieldChartData
    .map(item => ({ name: item.crop, value: item.observations }))
    .filter(item => item.value > 0);

  const COLORS = ['#16a34a', '#0ea5e9', '#f97316', '#a855f7', '#eab308', '#14b8a6'];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here&apos;s your farm overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Plot Locations ({plots.filter(p => p.latitude && p.longitude).length} mapped)</CardTitle>
        </CardHeader>
        <CardContent>
          <PlotMap mode="display" plots={plots} height="h-80" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
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
      </div>

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

      <Card>
        <CardHeader>
          <CardTitle>Yield Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {(dashboardData?.yieldSummary && dashboardData.yieldSummary.length > 0) ? (
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
                  {dashboardData.yieldSummary.map((item, idx) => (
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

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Recent Activity Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {(dashboardData?.recentLogs && dashboardData.recentLogs.length > 0) ? (
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
                  {dashboardData.recentLogs.map((log) => (
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
    </div>

  );
}
