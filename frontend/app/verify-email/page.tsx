'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

function VerifyEmailContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email address...');
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing verification token.');
      return;
    }

    const verifyToken = async () => {
      try {
        await apiClient.post('/auth/email/verify', { token });
        setStatus('success');
        setMessage('Your email has been successfully verified.');
      } catch (error: any) {
        setStatus('error');
        setMessage(error.message || 'Verification failed. The token may be expired or invalid.');
      }
    };

    verifyToken();
  }, [token]);

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Email Verification</CardTitle>
        <CardDescription>
          {status === 'loading' && 'Please wait while we verify your email address'}
          {status === 'success' && 'Verification Complete'}
          {status === 'error' && 'Verification Failed'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-6">
        {status === 'loading' && <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />}
        {status === 'success' && <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />}
        {status === 'error' && <XCircle className="h-16 w-16 text-destructive mb-4" />}
        
        <p className="text-center text-muted-foreground mb-8">{message}</p>
        
        {status !== 'loading' && (
          <Link href="/login" className="w-full">
            <Button className="w-full">
              {status === 'success' ? 'Continue to Login' : 'Back to Login'}
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Suspense fallback={
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
          </CardContent>
        </Card>
      }>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
