'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { Device, User } from '@/lib/types';
import { DataTable } from '@/components/data-table';
import { FormModal } from '@/components/form-modal';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';

export default function DevicesPage() {
  const { user } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    serialNumber: '',
    assignedUserId: 'none',
    status: 'offline' as 'online' | 'offline' | 'inactive',
  });

  useEffect(() => {
    fetchDevices();
    fetchUsers();
  }, []);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<{ meta: any; data: Device[] }>('/devices');
      const data = response.data;
      setDevices(data);
    } catch (error: any) {
      toast.error('Failed to load devices');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await apiClient.get<{ meta: any; data: User[] }>('/app-users');
      const data = response.data;
      setUsers(data);
    } catch (error: any) {
      toast.error('Failed to load users');
    }
  };

  const handleCreate = () => {
    setFormData({
      name: '',
      serialNumber: '',
      assignedUserId: 'none',
      status: 'offline',
    });
    setEditingDevice(null);
    setIsEdit(false);
    setModalOpen(true);
  };

  const handleEdit = (device: Device) => {
    setFormData({
      name: device.deviceName || '',
      serialNumber: device.deviceUuid || '',
      assignedUserId: device.userId || 'none',
      status: device.status || 'offline',
    });
    setEditingDevice(device);
    setIsEdit(true);
    setModalOpen(true);
  };

  const handleDelete = async (device: Device) => {
    if (!confirm(`Are you sure you want to delete "${device.name}"?`)) return;

    try {
      await apiClient.delete(`/devices/${device.id}`);
      toast.success('Device deleted successfully');
      setDevices(devices.filter((d) => d.id !== device.id));
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete device');
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Device name is required');
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit && editingDevice) {
        const patchPayload = {
          deviceName: formData.name,
        };
        await apiClient.patch(`/devices/${editingDevice.id}`, patchPayload);
        toast.success('Device updated successfully');
      } else {
        const payload = {
          deviceName: formData.name,
          deviceUuid: formData.serialNumber,
          userId: formData.assignedUserId === 'none' ? user?.appUserId : formData.assignedUserId,
        };
        const newDevice = await apiClient.post<Device>('/devices', payload);
        setDevices([...devices, newDevice]);
        toast.success('Device created successfully');
      }
      await fetchDevices();
    } catch (error: any) {
      console.error('Operation failed', error.response?.data || error);
      const message = error.response?.data?.errors?.[0]?.message || error.message || 'Operation failed';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-100 text-green-800';
      case 'offline':
        return 'bg-red-100 text-red-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
        <h1 className="text-3xl font-bold text-foreground">Devices</h1>
        <p className="text-muted-foreground mt-1">Manage mobile devices and field equipment</p>
      </div>

      <DataTable<Device>
        data={devices}
        columns={[
          { key: 'deviceName', label: 'Device Name' },
          { key: 'deviceUuid', label: 'Serial/UUID', render: (val) => val || '-' },
          {
            key: 'status',
            label: 'Status',
            render: (val) => (
              <Badge className={getStatusColor(String(val || 'offline'))}>
                {String(val || 'offline').charAt(0).toUpperCase() + String(val || 'offline').slice(1)}
              </Badge>
            ),
          },
          {
            key: 'userId',
            label: 'Assigned To',
            render: (_, device) => device.user
              ? device.user.fullName
              : '-',
          },
          {
            key: 'lastSyncAt',
            label: 'Last Sync',
            render: (val) => val ? new Date(val as string).toLocaleString() : '-',
          },
        ]}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreate={handleCreate}
        searchableColumns={['deviceName', 'deviceUuid']}
      />

      <FormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Device"
        isEdit={isEdit}
        onSubmit={handleSubmit}
        loading={submitting}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Device Name *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Field Tablet 001"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Serial Number
            </label>
            <Input
              value={formData.serialNumber}
              onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
              placeholder="Serial number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Assigned User
            </label>
            <Select value={formData.assignedUserId} onValueChange={(val) => setFormData({ ...formData, assignedUserId: val })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a user (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Unassigned</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.firstName} {user.lastName} ({user.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Status
            </label>
            <Select value={formData.status} onValueChange={(val: any) => setFormData({ ...formData, status: val })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </FormModal>
    </div>
  );
}
