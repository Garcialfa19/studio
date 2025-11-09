
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

const withAuth = <P extends object>(Component: React.ComponentType<P>) => {
  const AuthComponent = (props: P) => {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        router.push('/admin');
      }
    }, [user, loading, router]);

    if (loading || !user) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="space-y-4 w-full max-w-4xl p-8">
            <Skeleton className="h-12 w-1/4" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };

  AuthComponent.displayName = `withAuth(${Component.displayName || Component.name || 'Component'})`;
  
  return AuthComponent;
};

export default withAuth;
