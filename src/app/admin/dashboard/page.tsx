'use client';
import AdminDashboard from "@/components/admin/AdminDashboard";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import Link from "next/link";
import { useAuth } from "@/firebase";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";


export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin');
    }
  }, [user, loading, router]);
  
  const handleLogout = async () => {
    await logout();
    router.push('/admin');
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
          <Link href="/">
            <Logo />
          </Link>
          <h1 className="text-xl font-bold font-headline tracking-tight">Panel de Administración</h1>
          <div className="ml-auto flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar Sesión
              </Button>
          </div>
      </header>
      <main className="p-4 sm:px-6 sm:py-0">
          <AdminDashboard />
      </main>
    </div>
  );
}
