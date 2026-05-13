'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { Organization } from '@/lib/types';
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
import { toast } from 'sonner';

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '' as '' | 'cooperative' | 'ngo' | 'government' | 'private',
    region: '',
    contactPhone: '',
  });

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<{ meta: any; data: Organization[] }>('/organizations');
      const data = response.data;
      setOrganizations(data);
    } catch (error: any) {
      toast.error('Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({ name: '', type: '', region: '', contactPhone: '' });
    setEditingOrg(null);
    setIsEdit(false);
    setModalOpen(true);
  };

  const handleEdit = (org: Organization) => {
    setFormData({
      name: org.name,
      type: org.type || '',
      region: org.region || '',
      contactPhone: org.contactPhone || '',
    });
    setEditingOrg(org);
    setIsEdit(true);
    setModalOpen(true);
  };

  const handleDelete = async (org: Organization) => {
    if (!confirm(`Are you sure you want to delete "${org.name}"?`)) return;

    try {
      await apiClient.delete(`/organizations/${org.id}`);
      toast.success('Organization deleted successfully');
      setOrganizations(organizations.filter((o) => o.id !== org.id));
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete organization');
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Organization name is required');
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        name: formData.name,
      };
      
      if (formData.type) payload.type = formData.type;
      if (formData.region) payload.region = formData.region;
      if (formData.contactPhone) payload.contactPhone = formData.contactPhone;

      if (isEdit && editingOrg) {
        await apiClient.patch(`/organizations/${editingOrg.id}`, payload);
        toast.success('Organization updated successfully');
      } else {
        const newOrg = await apiClient.post<Organization>('/organizations', payload);
        setOrganizations([...organizations, newOrg]);
        toast.success('Organization created successfully');
      }
      await fetchOrganizations();
    } catch (error: any) {
      toast.error(error.message || 'Operation failed');
    } finally {
      setSubmitting(false);
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
        <h1 className="text-3xl font-bold text-foreground">Organizations</h1>
        <p className="text-muted-foreground mt-1">Manage your organizations</p>
      </div>

      <DataTable<Organization>
        data={organizations}
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'type', label: 'Type', render: (val) => val || '-' },
          { key: 'region', label: 'Region', render: (val) => val || '-' },
          { key: 'contactPhone', label: 'Phone', render: (val) => val || '-' },
          {
            key: 'createdAt',
            label: 'Created',
            render: (val) => new Date(val).toLocaleDateString(),
          },
        ]}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreate={handleCreate}
        searchableColumns={['name', 'region']}
      />

      <FormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Organization"
        isEdit={isEdit}
        onSubmit={handleSubmit}
        loading={submitting}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Name *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Organization name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Type
            </label>
            <Select 
              value={formData.type} 
              onValueChange={(val: any) => setFormData({ ...formData, type: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cooperative">Cooperative</SelectItem>
                <SelectItem value="ngo">NGO</SelectItem>
                <SelectItem value="government">Government</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Region
            </label>
            <Input
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              placeholder="Region"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Contact Phone
            </label>
            <Input
              value={formData.contactPhone}
              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              placeholder="Phone number"
            />
          </div>
        </div>
      </FormModal>
    </div>
  );
}
