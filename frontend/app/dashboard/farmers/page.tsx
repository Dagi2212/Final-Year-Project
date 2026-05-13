'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { Farmer } from '@/lib/types';
import { DataTable } from '@/components/data-table';
import { FormModal } from '@/components/form-modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';

export default function FarmersPage() {
  const { user } = useAuth();
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingFarmer, setEditingFarmer] = useState<Farmer | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    locationRegion: '',
    locationZone: '',
    locationWoreda: '',
    householdSize: '',
    notes: '',
  });

  useEffect(() => {
    fetchFarmers();
  }, [showDeleted]);

  const fetchFarmers = async () => {
    setLoading(true);
    try {
      const endpoint = showDeleted ? '/farmers?includeDeleted=true' : '/farmers';
      const response = await apiClient.get<{ meta: any; data: Farmer[] }>(endpoint);
      const data = response.data;
      setFarmers(data);
    } catch (error: any) {
      toast.error('Failed to load farmers');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({
      fullName: '',
      phone: '',
      locationRegion: '',
      locationZone: '',
      locationWoreda: '',
      householdSize: '',
      notes: '',
    });
    setEditingFarmer(null);
    setIsEdit(false);
    setModalOpen(true);
  };

  const handleEdit = (farmer: Farmer) => {
    setFormData({
      fullName: farmer.fullName,
      phone: farmer.phone || '',
      locationRegion: farmer.locationRegion || '',
      locationZone: farmer.locationZone || '',
      locationWoreda: farmer.locationWoreda || '',
      householdSize: farmer.householdSize?.toString() || '',
      notes: farmer.notes || '',
    });
    setEditingFarmer(farmer);
    setIsEdit(true);
    setModalOpen(true);
  };

  const handleDelete = async (farmer: Farmer) => {
    if (!confirm(`Are you sure you want to delete "${farmer.fullName}"?`)) return;

    try {
      await apiClient.delete(`/farmers/${farmer.id}`);
      toast.success('Farmer deleted successfully');
      await fetchFarmers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete farmer');
    }
  };

  const handleRestore = async (farmer: Farmer) => {
    try {
      await apiClient.post(`/farmers/${farmer.id}/restore`, {});
      toast.success('Farmer restored successfully');
      await fetchFarmers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to restore farmer');
    }
  };

  const handleSubmit = async () => {
    if (!formData.fullName.trim()) {
      toast.error('Full name is required');
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        fullName: formData.fullName,
        phone: formData.phone || undefined,
        locationRegion: formData.locationRegion || undefined,
        locationZone: formData.locationZone || undefined,
        locationWoreda: formData.locationWoreda || undefined,
        householdSize: formData.householdSize ? parseInt(formData.householdSize) : undefined,
        notes: formData.notes || undefined,
        createdBy: String(user?.appUserId || ''),
      };

      if (isEdit && editingFarmer) {
        await apiClient.patch(`/farmers/${editingFarmer.id}`, payload);
        toast.success('Farmer updated successfully');
      } else {
        const newFarmer = await apiClient.post<Farmer>('/farmers', payload);
        setFarmers([...farmers, newFarmer]);
        toast.success('Farmer created successfully');
      }
      await fetchFarmers();
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
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Farmers</h1>
          <p className="text-muted-foreground mt-1">Manage farmer records</p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowDeleted(!showDeleted)}
        >
          {showDeleted ? 'Hide Deleted' : 'Show Deleted'}
        </Button>
      </div>

      <DataTable<Farmer>
        data={farmers}
        columns={[
          { key: 'fullName', label: 'Name' },
          { key: 'phone', label: 'Phone', render: (val) => val || '-' },
          { key: 'locationRegion', label: 'Region', render: (val) => val || '-' },
          { key: 'locationZone', label: 'Zone', render: (val) => val || '-' },
          { key: 'locationWoreda', label: 'Woreda', render: (val) => val || '-' },
          {
            key: 'householdSize',
            label: 'Household',
            render: (val) => val || '-',
          },
          {
            key: 'deletedAt',
            label: 'Status',
            render: (val, farmer) => farmer.deletedAt ? (
              <span className="text-red-500">Deleted</span>
            ) : (
              <span className="text-green-500">Active</span>
            ),
          },
          {
            key: 'createdAt',
            label: 'Created',
            render: (val) => new Date(val).toLocaleDateString(),
          },
          {
            key: 'id',
            label: 'Actions',
            render: (_, farmer) => (
              <div className="flex gap-2">
                {!farmer.deletedAt ? (
                  <>
                    <button
                      onClick={() => handleEdit(farmer)}
                      className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(farmer)}
                      className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleRestore(farmer)}
                    className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200"
                  >
                    Restore
                  </button>
                )}
              </div>
            ),
          },
        ]}
        onCreate={handleCreate}
        searchableColumns={['fullName', 'phone', 'locationRegion', 'locationZone', 'locationWoreda']}
      />

      <FormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Farmer"
        isEdit={isEdit}
        onSubmit={handleSubmit}
        loading={submitting}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Full Name *
            </label>
            <Input
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Phone
            </label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Phone number"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Region
              </label>
              <Input
                value={formData.locationRegion}
                onChange={(e) => setFormData({ ...formData, locationRegion: e.target.value })}
                placeholder="Region"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Zone
              </label>
              <Input
                value={formData.locationZone}
                onChange={(e) => setFormData({ ...formData, locationZone: e.target.value })}
                placeholder="Zone"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Woreda
              </label>
              <Input
                value={formData.locationWoreda}
                onChange={(e) => setFormData({ ...formData, locationWoreda: e.target.value })}
                placeholder="Woreda"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Household Size
            </label>
            <Input
              type="number"
              value={formData.householdSize}
              onChange={(e) => setFormData({ ...formData, householdSize: e.target.value })}
              placeholder="Number of household members"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Notes
            </label>
            <Input
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes"
            />
          </div>
        </div>
      </FormModal>
    </div>
  );
}