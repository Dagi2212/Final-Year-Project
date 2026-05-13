'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { Observation, Plot, CropType } from '@/lib/types';
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

export default function ObservationsPage() {
  const { user } = useAuth();
  const [observations, setObservations] = useState<Observation[]>([]);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [cropTypes, setCropTypes] = useState<CropType[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingObs, setEditingObs] = useState<Observation | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [harvestOpen, setHarvestOpen] = useState(false);
  const [harvestingObs, setHarvestingObs] = useState<Observation | null>(null);
  const [harvestForm, setHarvestForm] = useState({ actualYieldKg: '', notes: '' });
  const [formData, setFormData] = useState({
    plotId: '',
    cropTypeId: '',
    plantingDate: '',
    expectedYieldKg: '',
    growthStage: '',
    healthStatus: '',
    pestIssues: '',
    fertilizerUsed: false,
    notes: '',
  });

  useEffect(() => {
    fetchObservations();
    fetchPlots();
    fetchCropTypes();
  }, [showDeleted]);

  const fetchObservations = async () => {
    setLoading(true);
    try {
      const endpoint = showDeleted ? '/observations?includeDeleted=true' : '/observations';
      const response = await apiClient.get<{ meta: any; data: Observation[] }>(endpoint);
      const data = response.data;
      setObservations(data);
    } catch (error: any) {
      toast.error('Failed to load observations');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlots = async () => {
    try {
      const response = await apiClient.get<{ meta: any; data: Plot[] }>('/plots');
      const data = response.data;
      setPlots(data);
    } catch (error: any) {
      toast.error('Failed to load plots');
    }
  };

  const fetchCropTypes = async () => {
    try {
      const data = await apiClient.get<CropType[]>('/crop-types');
      setCropTypes(data);
    } catch (error: any) {
      toast.error('Failed to load crop types');
    }
  };

  const handleCreate = () => {
    setFormData({
      plotId: '',
      cropTypeId: '',
      plantingDate: '',
      expectedYieldKg: '',
      growthStage: '',
      healthStatus: '',
      pestIssues: '',
      fertilizerUsed: false,
      notes: '',
    });
    setEditingObs(null);
    setIsEdit(false);
    setModalOpen(true);
  };

  const handleEdit = (obs: Observation) => {
    setFormData({
      plotId: obs.plotId,
      cropTypeId: obs.cropTypeId,
      plantingDate: obs.plantingDate?.split('T')[0] || '',
      expectedYieldKg: obs.expectedYieldKg?.toString() || '',
      growthStage: obs.growthStage || '',
      healthStatus: obs.healthStatus || '',
      pestIssues: obs.pestIssues || '',
      fertilizerUsed: obs.fertilizerUsed,
      notes: obs.notes || '',
    });
    setEditingObs(obs);
    setIsEdit(true);
    setModalOpen(true);
  };

  const handleDelete = async (obs: Observation) => {
    if (!confirm(`Are you sure you want to delete this observation?`)) return;

    try {
      await apiClient.delete(`/observations/${obs.id}`);
      toast.success('Observation deleted successfully');
      await fetchObservations();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete observation');
    }
  };

  const handleRestore = async (obs: Observation) => {
    try {
      await apiClient.post(`/observations/${obs.id}/restore`, {});
      toast.success('Observation restored successfully');
      await fetchObservations();
    } catch (error: any) {
      toast.error(error.message || 'Failed to restore observation');
    }
  };

  const handleHarvest = async () => {
    if (!harvestForm.actualYieldKg) {
      toast.error('Actual yield is required');
      return;
    }

    try {
      await apiClient.patch(`/observations/${harvestingObs?.id}/harvest`, {
        actualYieldKg: parseFloat(harvestForm.actualYieldKg),
        notes: harvestForm.notes || undefined,
      });
      toast.success('Harvest recorded successfully');
      setHarvestOpen(false);
      setHarvestingObs(null);
      setHarvestForm({ actualYieldKg: '', notes: '' });
      await fetchObservations();
    } catch (error: any) {
      toast.error(error.message || 'Failed to record harvest');
    }
  };

  const handleSubmit = async () => {
    if (!formData.plotId || !formData.cropTypeId) {
      toast.error('Plot and crop type are required');
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        plotId: formData.plotId,
        cropTypeId: formData.cropTypeId,
        plantingDate: formData.plantingDate || undefined,
        expectedYieldKg: formData.expectedYieldKg ? parseFloat(formData.expectedYieldKg) : undefined,
        growthStage: formData.growthStage || undefined,
        healthStatus: formData.healthStatus || undefined,
        pestIssues: formData.pestIssues || undefined,
        fertilizerUsed: formData.fertilizerUsed,
        notes: formData.notes || undefined,
        createdBy: String(user?.appUserId || ''),
      };

      if (isEdit && editingObs) {
        await apiClient.patch(`/observations/${editingObs.id}`, payload);
        toast.success('Observation updated successfully');
      } else {
        const newObs = await apiClient.post<Observation>('/observations', payload);
        setObservations([...observations, newObs]);
        toast.success('Observation created successfully');
      }
      await fetchObservations();
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
          <h1 className="text-3xl font-bold text-foreground">Observations</h1>
          <p className="text-muted-foreground mt-1">Field observations and monitoring records</p>
        </div>
        <Button variant="outline" onClick={() => setShowDeleted(!showDeleted)}>
          {showDeleted ? 'Hide Deleted' : 'Show Deleted'}
        </Button>
      </div>

      <DataTable<Observation>
        data={observations}
        columns={[
          {
            key: 'cropTypeId',
            label: 'Crop',
            render: (_, obs) => {
              const crop = cropTypes.find(c => c.id === obs.cropTypeId);
              return crop?.name || '-';
            },
          },
          { key: 'growthStage', label: 'Growth Stage', render: (val) => val || '-' },
          { key: 'healthStatus', label: 'Health', render: (val) => val || '-' },
          { key: 'expectedYieldKg', label: 'Expected Yield (kg)', render: (val) => val || '-' },
          { key: 'actualYieldKg', label: 'Actual Yield (kg)', render: (val) => val || '-' },
          {
            key: 'plantingDate',
            label: 'Planted',
            render: (val) => val ? new Date(val).toLocaleDateString() : '-',
          },
          {
            key: 'deletedAt',
            label: 'Status',
            render: (val, obs) => obs.deletedAt ? (
              <span className="text-red-500">Deleted</span>
            ) : (
              <span className="text-green-500">Active</span>
            ),
          },
          {
            key: 'id',
            label: 'Actions',
            render: (_, obs) => (
              <div className="flex gap-2">
                {!obs.deletedAt ? (
                  <>
                    <button
                      onClick={() => handleEdit(obs)}
                      className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setHarvestingObs(obs);
                        setHarvestForm({
                          actualYieldKg: obs.actualYieldKg?.toString() || '',
                          notes: obs.notes || '',
                        });
                        setHarvestOpen(true);
                      }}
                      className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200"
                    >
                      Harvest
                    </button>
                    <button
                      onClick={() => handleDelete(obs)}
                      className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleRestore(obs)}
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
        searchableColumns={['growthStage', 'healthStatus']}
      />

      <FormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Observation"
        isEdit={isEdit}
        onSubmit={handleSubmit}
        loading={submitting}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Plot *
            </label>
            <Select value={formData.plotId} onValueChange={(val) => setFormData({ ...formData, plotId: val })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a plot" />
              </SelectTrigger>
              <SelectContent>
                {plots.map((plot) => (
                  <SelectItem key={plot.id} value={plot.id}>
                    {plot.plotName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Crop Type *
            </label>
            <Select value={formData.cropTypeId} onValueChange={(val) => setFormData({ ...formData, cropTypeId: val })}>
              <SelectTrigger>
                <SelectValue placeholder="Select crop type" />
              </SelectTrigger>
              <SelectContent>
                {cropTypes.map((crop) => (
                  <SelectItem key={crop.id} value={crop.id}>
                    {crop.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Planting Date
              </label>
              <Input
                type="date"
                value={formData.plantingDate}
                onChange={(e) => setFormData({ ...formData, plantingDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Expected Yield (kg)
              </label>
              <Input
                type="number"
                value={formData.expectedYieldKg}
                onChange={(e) => setFormData({ ...formData, expectedYieldKg: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Growth Stage
              </label>
              <Input
                value={formData.growthStage}
                onChange={(e) => setFormData({ ...formData, growthStage: e.target.value })}
                placeholder="e.g., vegetative, flowering"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Health Status
              </label>
              <Input
                value={formData.healthStatus}
                onChange={(e) => setFormData({ ...formData, healthStatus: e.target.value })}
                placeholder="e.g., healthy, diseased"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Pest Issues
            </label>
            <Input
              value={formData.pestIssues}
              onChange={(e) => setFormData({ ...formData, pestIssues: e.target.value })}
              placeholder="Describe any pest issues"
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

      <FormModal
        open={harvestOpen}
        onOpenChange={setHarvestOpen}
        title="Record Harvest"
        isEdit={false}
        onSubmit={handleHarvest}
        loading={submitting}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Actual Yield (kg) *
            </label>
            <Input
              type="number"
              value={harvestForm.actualYieldKg}
              onChange={(e) => setHarvestForm({ ...harvestForm, actualYieldKg: e.target.value })}
              placeholder="Actual yield in kg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Notes
            </label>
            <Input
              value={harvestForm.notes}
              onChange={(e) => setHarvestForm({ ...harvestForm, notes: e.target.value })}
              placeholder="Harvest notes"
            />
          </div>
        </div>
      </FormModal>
    </div>
  );
}