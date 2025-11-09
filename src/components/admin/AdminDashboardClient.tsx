
'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/shared/Logo";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import type { Route, Alert, Driver } from "@/lib/definitions";
import { dataService } from "@/lib/data-service-client";
import { authService } from "@/lib/auth-service";
import { useFirebase } from "@/lib/firebase-client-provider";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RoutesManager from './RoutesManager';
import DriversManager from './DriversManager';
import AlertsManager from './AlertsManager';

export default function AdminDashboardClient() {
  const [data, setData] = useState<{ routes: Route[]; alerts: Alert[]; drivers: Driver[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useFirebase();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await authService.signOut();
      router.push('/admin');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const refreshData = async () => {
    setIsLoading(true);
    try {
        const [routesSnapshot, alertsSnapshot, driversSnapshot] = await Promise.all([
            dataService.getRoutes(),
            dataService.getAlerts(),
            dataService.getDrivers()
        ]);
        const routes = routesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Route[];
        const alerts = alertsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Alert[];
        const drivers = driversSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Driver[];
        setData({ routes, alerts, drivers });
    } catch (error) {
        console.error("Failed to refresh data", error);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
          <Link href="/">
            <Logo />
          </Link>
          <h1 className="text-xl font-bold font-headline tracking-tight">Panel de Administración</h1>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">Hola, {user?.email}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>Cerrar Sesión</Button>
          </div>
      </header>
      <main className="p-4 sm:px-6 sm:py-0">
          {isLoading || !data ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-96 mx-auto" />
              <Skeleton className="h-96 w-full" />
            </div>
          ) : (
            <Tabs defaultValue="routes">
                <TabsList className="mb-4">
                    <TabsTrigger value="routes">Rutas</TabsTrigger>
                    <TabsTrigger value="drivers">Choferes</TabsTrigger>
                    <TabsTrigger value="alerts">Alertas</TabsTrigger>
                </TabsList>
                <TabsContent value="routes"><RoutesManager routes={data.routes} onDataChange={refreshData} /></TabsContent>
                <TabsContent value="drivers"><DriversManager drivers={data.drivers} routes={data.routes} onDataChange={refreshData} /></TabsContent>
                <TabsContent value="alerts"><AlertsManager alerts={data.alerts} onDataChange={refreshData} /></TabsContent>
            </Tabs>
          )}
      </main>
    </div>
  );
}
