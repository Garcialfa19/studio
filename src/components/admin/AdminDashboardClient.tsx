'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import type { Route, Alert, Driver } from "@/lib/definitions";
import { getRoutes, getAlerts, getDrivers } from "@/lib/data-service-client";
import { useAuth } from "@/firebase/provider";
import AdminDashboard from "./AdminDashboard";

type AdminDashboardClientProps = {
  initialData: {
    routes: Route[];
    alerts: Alert[];
    drivers: Driver[];
  };
};

export default function AdminDashboardClient({ initialData }: AdminDashboardClientProps) {
  const { user, isUserLoading, auth } = useAuth();
  const router = useRouter();
  
  const [data, setData] = useState(initialData);
  const [isDataLoading, setIsDataLoading] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/admin');
    }
  }, [user, isUserLoading, router]);
  
  const handleLogout = async () => {
    if (auth) {
      await auth.signOut();
    }
    router.push('/admin');
  };

  const refreshData = async () => {
    setIsDataLoading(true);
    try {
        const [routesData, alertsData, driversData] = await Promise.all([
            getRoutes(),
            getAlerts(),
            getDrivers()
        ]);
        setData({ routes: routesData, alerts: alertsData, drivers: driversData });
    } catch (error) {
        console.error("Failed to refresh data", error);
    } finally {
        setIsDataLoading(false);
    }
  };


  if (isUserLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-4 p-4 w-full max-w-4xl">
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-8 w-24" />
          </div>
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-96 w-full" />
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
          {isDataLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-96 mx-auto" />
              <Skeleton className="h-96 w-full" />
            </div>
          ) : (
            <AdminDashboard initialData={data} onDataChange={refreshData} />
          )}
      </main>
    </div>
  );
}
