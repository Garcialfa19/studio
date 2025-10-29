'use client';
import AdminDashboard from "@/components/admin/AdminDashboard";
import { getRoutes, getAlerts, getDrivers } from "@/lib/data-service";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import Link from "next/link";
import { useAuth } from "@/firebase";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { type Route, type Alert, type Driver } from "@/lib/definitions";


export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  
  const [routes, setRoutes] = useState<Route[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin');
    }
  }, [user, loading, router]);
  
  useEffect(() => {
    async function loadData() {
      if(user) {
        try {
          const [routesData, alertsData, driversData] = await Promise.all([
            getRoutes(),
            getAlerts(),
            getDrivers(),
          ]);
          setRoutes(routesData);
          setAlerts(alertsData);
          setDrivers(driversData);
        } catch (error) {
          console.error("Failed to load dashboard data", error);
        } finally {
          setDataLoading(false);
        }
      }
    }
    loadData();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push('/admin');
  };

  if (loading || dataLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Cargando...</p>
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
        <AdminDashboard initialRoutes={routes} initialAlerts={alerts} initialDrivers={drivers} />
      </main>
    </div>
  );
}
