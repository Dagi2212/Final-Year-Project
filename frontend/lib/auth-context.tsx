'use client';

import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { apiClient } from './api-client';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  organizationId?: string;
  createdAt: string;
  updatedAt: string;
  appUserId?: string; // The UUID from app_users table
}

export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = apiClient.getToken();
      if (token) {
        try {
          const response = await apiClient.get<any>('/account/profile');
          const currentUser = response?.data || response;
          
          try {
            const usersRes = await apiClient.get<any>('/app-users');
            const matchingAppUser = usersRes?.data?.find((u: any) => u.email === currentUser.email);
            if (matchingAppUser) {
              currentUser.appUserId = matchingAppUser.id;
              currentUser.role = matchingAppUser.role;
            }
          } catch (e) {
            console.error('Failed to map app_user', e);
          }

          setUser(currentUser);
        } catch (err) {
          apiClient.clearToken();
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response: any = await apiClient.post(
        '/auth/login',
        { email, password }
      );

      // Handle cases where the backend wraps the response in a 'data' object
      const token = response?.token || response?.data?.token;
      const user = response?.user || response?.data?.user;

      if (!token) {
         throw new Error('No token received from server');
      }

      apiClient.setToken(token);
      
      try {
        const usersRes = await apiClient.get<any>('/app-users');
        const matchingAppUser = usersRes?.data?.find((u: any) => u.email === user.email);
        if (matchingAppUser) {
          user.appUserId = matchingAppUser.id;
          user.role = matchingAppUser.role;
        }
      } catch (e) {
        console.error('Failed to map app_user', e);
      }

      setUser(user);
    } catch (err: any) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(
    async (email: string, password: string, firstName: string, lastName: string) => {
      setLoading(true);
      setError(null);
      try {
        const fullName = `${firstName} ${lastName}`.trim();
        const response: any = await apiClient.post(
          '/auth/signup',
          { email, password, passwordConfirmation: password, fullName }
        );

        const token = response?.token || response?.data?.token;
        const user = response?.user || response?.data?.user;

        if (!token) {
           throw new Error('No token received from server');
        }

        apiClient.setToken(token);
        setUser(user);
      } catch (err: any) {
        const errorMessage = err.message || 'Signup failed';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await apiClient.post('/auth/logout', {});
    } catch (err) {
      // Ignore errors on logout
    } finally {
      apiClient.clearToken();
      setUser(null);
      setLoading(false);
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
