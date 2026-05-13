'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user } = useAuth();
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });

  const handleSaveProfile = () => {
    // API call would go here
    toast.success('Profile updated (demo mode)');
    setEditingProfile(false);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      <div className="space-y-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  First Name
                </label>
                <Input
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                  disabled={!editingProfile}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Last Name
                </label>
                <Input
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                  disabled={!editingProfile}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <Input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                disabled={true}
              />
              <p className="text-xs text-muted-foreground mt-2">Email cannot be changed</p>
            </div>

            {user && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Role
                </label>
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm capitalize">{user.role.replace('_', ' ')}</p>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              {editingProfile ? (
                <>
                  <Button onClick={handleSaveProfile} className="flex-1">
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditingProfile(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setEditingProfile(true)}
                  className="flex-1"
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive updates about your data</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Daily Report</p>
                <p className="text-sm text-muted-foreground">Send daily summary of activities</p>
              </div>
              <input type="checkbox" className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Account Created</span>
              <span className="font-medium">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Updated</span>
              <span className="font-medium">
                {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : '-'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
