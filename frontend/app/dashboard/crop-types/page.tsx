'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { CropType } from '@/lib/types';
import { DataTable } from '@/components/data-table';
import { FormModal } from '@/components/form-modal';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function CropTypesPage() {
  const [cropTypes, setCropTypes] = useState<CropType[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingCrop, setEditingCrop] = useState<CropType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    localName: '',
    category: '',
    description: '',
  });

  useEffect(() => {
    fetchCropTypes();
  }, []);

  const fetchCropTypes = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get<CropType[]>('/crop-types');
      setCropTypes(data);
    } catch (error: any) {
      toast.error('Failed to load crop types');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({
      name: '',
      localName: '',
      category: '',
      description: '',
    });
    setEditingCrop(null);
    setIsEdit(false);
    setModalOpen(true);
  };

  const handleEdit = (crop: CropType) => {
    setFormData({
      name: crop.name,
      localName: crop.localName || '',
      category: crop.category || '',
      description: crop.description || '',
    });
    setEditingCrop(crop);
    setIsEdit(true);
    setModalOpen(true);
  };

  const handleDelete = async (crop: CropType) => {
    if (!confirm(`Are you sure you want to delete "${crop.name}"?`)) return;

    try {
      await apiClient.delete(`/crop-types/${crop.id}`);
      toast.success('Crop type deleted successfully');
      setCropTypes(cropTypes.filter((c) => c.id !== crop.id));
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete crop type');
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Crop name is required');
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        name: formData.name,
      };

      if (formData.localName) payload.localName = formData.localName;
      if (formData.category) payload.category = formData.category;
      if (formData.description) payload.description = formData.description;

      if (isEdit && editingCrop) {
        await apiClient.patch(`/crop-types/${editingCrop.id}`, payload);
        toast.success('Crop type updated successfully');
      } else {
        const newCrop = await apiClient.post<CropType>('/crop-types', payload);
        setCropTypes([...cropTypes, newCrop]);
        toast.success('Crop type created successfully');
      }
      await fetchCropTypes();
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
        <h1 className="text-3xl font-bold text-foreground">Crop Types</h1>
        <p className="text-muted-foreground mt-1">Manage crop type definitions</p>
      </div>

      <DataTable<CropType>
        data={cropTypes}
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'localName', label: 'Local Name', render: (val) => val || '-' },
          { key: 'category', label: 'Category', render: (val) => val || '-' },
          { key: 'description', label: 'Description', render: (val) => val || '-' },
          {
            key: 'createdAt',
            label: 'Created',
            render: (val) => new Date(val).toLocaleDateString(),
          },
        ]}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreate={handleCreate}
        searchableColumns={['name', 'localName', 'category']}
      />

      <FormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Crop Type"
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
              placeholder="e.g., Maize, Wheat, Rice"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Local Name
            </label>
            <Input
              value={formData.localName}
              onChange={(e) => setFormData({ ...formData, localName: e.target.value })}
              placeholder="Local name in local language"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Category
            </label>
            <Input
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g., Cereal, Legume, Vegetable"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Description
            </label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description"
            />
          </div>
        </div>
      </FormModal>
    </div>
  );
}