'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Since there is no authentication, this page just redirects to the dashboard.
export default function AdminLoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/dashboard');
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted p-4">
      <p>Redirigiendo al panel de administración...</p>
    </div>
  );
}
