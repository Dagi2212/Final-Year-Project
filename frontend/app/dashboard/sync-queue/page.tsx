'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { SyncQueueItem } from '@/lib/types';
import { DataTable } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function SyncQueuePage() {
  const [items, setItems] = useState<SyncQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchSyncQueue();
  }, []);

  const fetchSyncQueue = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<{ meta: any; data: SyncQueueItem[] }>('/sync-queue');
      setItems(response.data);
    } catch (error: any) {
      toast.error('Failed to load sync queue');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (item: SyncQueueItem) => {
    try {
      await apiClient.post(`/sync-queue/${item.id}/retry`, {});
      toast.success('Retry initiated');
      await fetchSyncQueue();
    } catch (error: any) {
      toast.error(error.message || 'Failed to retry');
    }
  };

  const handleUpdateStatus = async (item: SyncQueueItem, newStatus: string) => {
    try {
      await apiClient.patch(`/sync-queue/${item.id}/status`, {
        status: newStatus,
      });
      toast.success('Status updated');
      await fetchSyncQueue();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'conflict':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredItems = filterStatus === 'all'
    ? items
    : items.filter(item => item.status === filterStatus);

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
        <h1 className="text-3xl font-bold text-foreground">Sync Queue</h1>
        <p className="text-muted-foreground mt-1">Manage offline sync queue</p>
      </div>

      <div className="flex gap-2 mb-4">
        {['all', 'pending', 'processing', 'completed', 'failed', 'conflict'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1 rounded-full text-sm capitalize ${
              filterStatus === status
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <DataTable<SyncQueueItem>
        data={filteredItems}
        columns={[
          { key: 'batchId', label: 'Batch ID', render: (val) => String(val).substring(0, 8) + '...' },
          { key: 'entityType', label: 'Entity Type' },
          { key: 'operation', label: 'Operation' },
          {
            key: 'status',
            label: 'Status',
            render: (val) => (
              <Badge className={getStatusColor(String(val))}>
                {String(val)}
              </Badge>
            ),
          },
          { key: 'retryCount', label: 'Retries' },
          { key: 'errorMessage', label: 'Error', render: (val) => val || '-' },
          {
            key: 'createdAt',
            label: 'Created',
            render: (val) => new Date(val).toLocaleString(),
          },
          {
            key: 'actions',
            label: 'Actions',
            render: (_, item) => (
              <div className="flex gap-2">
                {item.status === 'failed' && (
                  <button
                    onClick={() => handleRetry(item)}
                    className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200"
                  >
                    Retry
                  </button>
                )}
                {(item.status === 'pending' || item.status === 'processing') && (
                  <button
                    onClick={() => handleUpdateStatus(item, 'completed')}
                    className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200"
                  >
                    Complete
                  </button>
                )}
              </div>
            ),
          },
        ]}
        searchableColumns={['entityType', 'batchId', 'errorMessage']}
        pageSize={20}
      />
    </div>
  );
}