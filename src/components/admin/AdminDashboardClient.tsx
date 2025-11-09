
'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/shared/Logo";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import type { Route, Alert, Driver } from "@/lib/definitions";
import { getRoutes, getAlerts, getDrivers } from "@/lib/data-service-client";
import AdminDashboard from "./AdminDashboard";

type AdminDashboardClientProps = {
  initialDataPromise: Promise<{
    routes: Route[];
    alerts: Alert[];
    drivers: Driver[];
  }>;
};

export default function AdminDashboardClient({ initialDataPromise }: AdminDashboardClientProps) {
  const [data, setData] = useState<{ routes: Route[], alerts: Alert[], drivers: Driver[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initialDataPromise.then(initialData => {
      setData(initialData);
      setIsLoading(false);
    });
  }, [initialDataPromise]);
  
  const refreshData = async () => {
    setIsLoading(true);
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
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
          <Link href="/">
            <Logo />
          </Link>
          <h1 className="text-xl font-bold font-headline tracking-tight">Panel de Administración</h1>
      </header>
      <main className="p-4 sm:px-6 sm:py-0">
          {isLoading || !data ? (
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
