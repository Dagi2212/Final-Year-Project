'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = apiClient.getToken();
    if (token) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}
