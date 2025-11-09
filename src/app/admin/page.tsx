
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page is no longer a login page. It just redirects to the dashboard.
export default function AdminPage() {
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
