'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { DashboardIndexResponse } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Cpu, MapPin, Eye, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardIndexResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const data = await apiClient.get<DashboardIndexResponse>('/dashboard');
        setDashboardData(data);
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
  const pendingSyncs = dashboardData?.summary?.pendingSyncs || 0;
  
  const syncStatus = dashboardData?.syncStatus || [];
  const pending = syncStatus.reduce((sum, item) => sum + Number(item.pending_count || 0), 0);
  const failed = syncStatus.reduce((sum, item) => sum + Number(item.failed_count || 0), 0);
  const conflict = syncStatus.reduce((sum, item) => sum + Number(item.conflict_count || 0), 0);

  const deviceStatusData = [
    { name: 'Pending', value: pending },
    { name: 'Failed', value: failed },
    { name: 'Conflict', value: conflict },
  ].filter(d => d.value > 0);


  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

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
            <div className="text-2xl font-bold">{totalPlots}</div>
            <p className="text-xs text-muted-foreground mt-1">Field observations recorded</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sync Pending</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingSyncs}</div>
            <p className="text-xs text-muted-foreground mt-1">Items waiting to sync</p>

          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Sync Status</CardTitle>
          </CardHeader>
          <CardContent>
            {deviceStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={deviceStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {deviceStatusData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-12">No sync data available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Farmer Counts by Organization</CardTitle>

          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={(dashboardData?.farmerCounts || []).slice(0, 10).map(item => ({
                  name: item.organization_name || 'Unknown',
                  value: Number(item.farmer_count) || 0,
                }))}

              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

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
