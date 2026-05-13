'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { User } from '@/lib/types';
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

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    role: 'field_agent' as 'admin' | 'supervisor' | 'field_agent',
    password: '',
  });

  useEffect(() => {
    fetchUsers();
  }, [showInactive]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const endpoint = showInactive ? '/app-users?isActive=false' : '/app-users';
      const response = await apiClient.get<{ meta: any; data: User[] }>(endpoint);
      const data = response.data;
      setUsers(data);
    } catch (error: any) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({
      email: '',
      fullName: '',
      role: 'field_agent',
      password: '',
    });
    setEditingUser(null);
    setIsEdit(false);
    setModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setFormData({
      email: user.email || '',
      fullName: user.fullName,
      role: user.role || 'field_agent',
      password: '',
    });
    setEditingUser(user);
    setIsEdit(true);
    setModalOpen(true);
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`Are you sure you want to delete "${user.email}"?`)) return;

    try {
      await apiClient.delete(`/app-users/${user.id}?hard=false`);
      toast.success('User deactivated successfully');
      await fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete user');
    }
  };

  const handleActivate = async (user: User) => {
    try {
      await apiClient.patch(`/app-users/${user.id}/activate`, {});
      toast.success('User activated successfully');
      await fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to activate user');
    }
  };

  const handleSubmit = async () => {
    if (!formData.email.trim() || !formData.fullName.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!isEdit && !formData.password) {
      toast.error('Password is required for new users');
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        email: formData.email,
        fullName: formData.fullName,
        role: formData.role,
      };

      if (formData.password) {
        payload.passwordHash = formData.password;
      }

      if (isEdit && editingUser) {
        await apiClient.patch(`/app-users/${editingUser.id}`, payload);
        toast.success('User updated successfully');
      } else {
        const newUser = await apiClient.post<User>('/app-users', payload);
        setUsers([...users, newUser]);
        toast.success('User created successfully');
      }
      await fetchUsers();
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
          <h1 className="text-3xl font-bold text-foreground">Users</h1>
          <p className="text-muted-foreground mt-1">Manage system users and their roles</p>
        </div>
        <Button variant="outline" onClick={() => setShowInactive(!showInactive)}>
          {showInactive ? 'Show Active' : 'Show Inactive'}
        </Button>
      </div>

      <DataTable<User>
        data={users}
        columns={[
          { key: 'fullName', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'role', label: 'Role', render: (val) => <span className="capitalize">{String(val).replace('_', ' ')}</span> },
          {
            key: 'isActive',
            label: 'Status',
            render: (val) => val ? (
              <span className="text-green-500">Active</span>
            ) : (
              <span className="text-red-500">Inactive</span>
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
            render: (_, user) => (
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(user)}
                  className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200"
                >
                  Edit
                </button>
                {user.isActive ? (
                  <button
                    onClick={() => handleDelete(user)}
                    className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded hover:bg-red-200"
                  >
                    Deactivate
                  </button>
                ) : (
                  <button
                    onClick={() => handleActivate(user)}
                    className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200"
                  >
                    Activate
                  </button>
                )}
              </div>
            ),
          },
        ]}
        onCreate={handleCreate}
        searchableColumns={['email', 'fullName']}
      />

      <FormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="User"
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
              Email *
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="user@example.com"
              disabled={isEdit}
            />
          </div>
          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Password *
              </label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Role *
            </label>
            <Select value={formData.role} onValueChange={(val: any) => setFormData({ ...formData, role: val })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="supervisor">Supervisor</SelectItem>
                <SelectItem value="field_agent">Field Agent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </FormModal>
    </div>
  );
}