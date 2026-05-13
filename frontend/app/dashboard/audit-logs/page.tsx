'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { AuditLog } from '@/lib/types';
import { DataTable } from '@/components/data-table';
import { toast } from 'sonner';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<{ meta: any; data: AuditLog[] }>('/audit-logs');
      const data = response.data;
      setLogs(data);
    } catch (error: any) {
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Audit Logs</h1>
        <p className="text-muted-foreground mt-1">System activity and change history</p>
      </div>

      <DataTable<AuditLog>
        data={logs}
        columns={[
          { key: 'action', label: 'Action' },
          { key: 'tableName', label: 'Table' },
          { key: 'recordId', label: 'Record ID', render: (val) => String(val).substring(0, 8) + '...' },
          { key: 'userId', label: 'User ID', render: (val) => val ? String(val).substring(0, 8) + '...' : 'System' },
          {
            key: 'createdAt',
            label: 'Timestamp',
            render: (val) => new Date(val).toLocaleString(),
          },
        ]}
        searchableColumns={['action', 'tableName']}
        pageSize={20}
      />
    </div>
  );
}
