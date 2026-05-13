'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { Plot, Farmer } from '@/lib/types';
import { DataTable } from '@/components/data-table';
import { FormModal } from '@/components/form-modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';

export default function PlotsPage() {
  const { user } = useAuth();
  const [plots, setPlots] = useState<Plot[]>([]);
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingPlot, setEditingPlot] = useState<Plot | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [nearbyOpen, setNearbyOpen] = useState(false);
  const [nearbyResults, setNearbyResults] = useState<Plot[]>([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbyForm, setNearbyForm] = useState({ lat: '', lng: '', radiusKm: '5' });
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    areaSize: '',
    cropType: '',
    plantingDate: '',
    farmerId: '',
  });

  useEffect(() => {
    fetchPlots();
    fetchFarmers();
  }, [showDeleted]);

  const fetchPlots = async () => {
    setLoading(true);
    try {
      const endpoint = showDeleted ? '/plots?includeDeleted=true' : '/plots';
      const response = await apiClient.get<{ meta: any; data: Plot[] }>(endpoint);
      const data = response.data;
      setPlots(data);
    } catch (error: any) {
      toast.error('Failed to load plots');
    } finally {
      setLoading(false);
    }
  };

  const fetchFarmers = async () => {
    try {
      const response = await apiClient.get<{ meta: any; data: Farmer[] }>('/farmers');
      const data = response.data;
      setFarmers(data);
    } catch (error: any) {
      toast.error('Failed to load farmers');
    }
  };

  const handleCreate = () => {
    setFormData({
      name: '',
      location: '',
      areaSize: '',
      cropType: '',
      plantingDate: '',
      farmerId: '',
    });
    setEditingPlot(null);
    setIsEdit(false);
    setModalOpen(true);
  };

  const handleEdit = (plot: Plot) => {
    setFormData({
      name: plot.plotName || '',
      location: '',
      areaSize: plot.areaSqm?.toString() || '',
      cropType: plot.soilType || '',
      plantingDate: '',
      farmerId: plot.farmerId,
    });
    setEditingPlot(plot);
    setIsEdit(true);
    setModalOpen(true);
  };

  const handleDelete = async (plot: Plot) => {
    if (!confirm(`Are you sure you want to delete "${plot.plotName}"?`)) return;

    try {
      await apiClient.delete(`/plots/${plot.id}`);
      toast.success('Plot deleted successfully');
      await fetchPlots();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete plot');
    }
  };

  const handleRestore = async (plot: Plot) => {
    try {
      await apiClient.post(`/plots/${plot.id}/restore`, {});
      toast.success('Plot restored successfully');
      await fetchPlots();
    } catch (error: any) {
      toast.error(error.message || 'Failed to restore plot');
    }
  };

  const handleNearbySearch = async () => {
    if (!nearbyForm.lat || !nearbyForm.lng) {
      toast.error('Please enter latitude and longitude');
      return;
    }

    setNearbyLoading(true);
    try {
      const params = new URLSearchParams({
        lat: nearbyForm.lat,
        lng: nearbyForm.lng,
        radiusKm: nearbyForm.radiusKm,
      });
      const response = await apiClient.get<Plot[]>(`/plots/nearby?${params}`);
      setNearbyResults(response);
    } catch (error: any) {
      toast.error(error.message || 'Failed to search nearby plots');
    } finally {
      setNearbyLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.farmerId) {
      toast.error('Plot name and farmer are required');
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        plotName: formData.name,
        farmerId: formData.farmerId,
        areaSqm: formData.areaSize ? parseFloat(formData.areaSize) : undefined,
        soilType: formData.cropType || undefined,
        createdBy: String(user?.appUserId || ''),
      };

      if (isEdit && editingPlot) {
        await apiClient.patch(`/plots/${editingPlot.id}`, payload);
        toast.success('Plot updated successfully');
      } else {
        const newPlot = await apiClient.post<Plot>('/plots', payload);
        setPlots([...plots, newPlot]);
        toast.success('Plot created successfully');
      }
      await fetchPlots();
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
          <h1 className="text-3xl font-bold text-foreground">Plots</h1>
          <p className="text-muted-foreground mt-1">Manage agricultural plots</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setNearbyOpen(true)}>
            Nearby
          </Button>
          <Button variant="outline" onClick={() => setShowDeleted(!showDeleted)}>
            {showDeleted ? 'Hide Deleted' : 'Show Deleted'}
          </Button>
        </div>
      </div>

      <DataTable<Plot>
        data={plots}
        columns={[
          { key: 'plotName', label: 'Plot Name' },
          {
            key: 'farmerId',
            label: 'Farmer',
            render: (_, plot) => {
              const farmer = farmers.find(f => f.id === plot.farmerId);
              return farmer?.fullName || '-';
            },
          },
          { key: 'areaSqm', label: 'Area (sqm)', render: (val) => val || '-' },
          { key: 'soilType', label: 'Soil Type', render: (val) => val || '-' },
          { key: 'irrigation', label: 'Irrigation', render: (val) => val ? 'Yes' : 'No' },
          {
            key: 'deletedAt',
            label: 'Status',
            render: (val, plot) => plot.deletedAt ? (
              <span className="text-red-500">Deleted</span>
            ) : (
              <span className="text-green-500">Active</span>
            ),
          },
          {
            key: 'id',
            label: 'Actions',
            render: (_, plot) => (
              <div className="flex gap-2">
                {!plot.deletedAt ? (
                  <>
                    <button
                      onClick={() => handleEdit(plot)}
                      className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(plot)}
                      className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleRestore(plot)}
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
        searchableColumns={['plotName', 'soilType']}
      />

      <FormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Plot"
        isEdit={isEdit}
        onSubmit={handleSubmit}
        loading={submitting}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Plot Name *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Plot name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Farmer *
            </label>
            <Select value={formData.farmerId} onValueChange={(val) => setFormData({ ...formData, farmerId: val })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a farmer" />
              </SelectTrigger>
              <SelectContent>
                {farmers.map((farmer) => (
                  <SelectItem key={farmer.id} value={farmer.id}>
                    {farmer.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Area (sqm)
              </label>
              <Input
                type="number"
                value={formData.areaSize}
                onChange={(e) => setFormData({ ...formData, areaSize: e.target.value })}
                placeholder="0.00"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Soil Type
              </label>
              <Input
                value={formData.cropType}
                onChange={(e) => setFormData({ ...formData, cropType: e.target.value })}
                placeholder="e.g., Clay, Sandy"
              />
            </div>
          </div>
        </div>
      </FormModal>

      <FormModal
        open={nearbyOpen}
        onOpenChange={setNearbyOpen}
        title="Find Nearby Plots"
        isEdit={false}
        onSubmit={handleNearbySearch}
        loading={nearbyLoading}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Latitude
              </label>
              <Input
                type="number"
                step="0.0001"
                value={nearbyForm.lat}
                onChange={(e) => setNearbyForm({ ...nearbyForm, lat: e.target.value })}
                placeholder="e.g., 9.0222"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Longitude
              </label>
              <Input
                type="number"
                step="0.0001"
                value={nearbyForm.lng}
                onChange={(e) => setNearbyForm({ ...nearbyForm, lng: e.target.value })}
                placeholder="e.g., 38.7575"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Radius (km)
            </label>
            <Input
              type="number"
              value={nearbyForm.radiusKm}
              onChange={(e) => setNearbyForm({ ...nearbyForm, radiusKm: e.target.value })}
              placeholder="5"
            />
          </div>
          {nearbyResults.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Results ({nearbyResults.length}):</p>
              <ul className="max-h-40 overflow-y-auto border rounded">
                {nearbyResults.map((plot) => (
                  <li key={plot.id} className="p-2 border-b text-sm">
                    {plot.plotName} ({plot.areaSqm} sqm)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </FormModal>
    </div>
  );
}