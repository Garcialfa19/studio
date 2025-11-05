"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RoutesManager from "@/components/admin/RoutesManager";
import AlertsManager from "@/components/admin/AlertsManager";
import DriversManager from "@/components/admin/DriversManager";
import { Skeleton } from "../ui/skeleton";
import type { Route, Alert, Driver } from "@/lib/definitions";
import { useEffect } from "react";
import { getRoutes, getAlerts, getDrivers } from "@/lib/data-service";

export default function AdminDashboard() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataVersion, setDataVersion] = useState(0);

  const refreshData = () => {
    setDataVersion(prev => prev + 1);
  };
  
  useEffect(() => {
    async function loadData() {
        setLoading(true);
        try {
            const [routesData, alertsData, driversData] = await Promise.all([
                getRoutes(),
                getAlerts(),
                getDrivers()
            ]);
            setRoutes(routesData);
            setAlerts(alertsData);
            setDrivers(driversData);
        } catch (error) {
            console.error("Failed to load data", error);
            // Optionally, show a toast message to the user
        } finally {
            setLoading(false);
        }
    }
    loadData();
  }, [dataVersion]);


  if (loading) {
    return (
        <div className="space-y-4">
          <Skeleton className="h-10 w-96 mx-auto" />
          <Skeleton className="h-96 w-full" />
        </div>
      );
  }

  return (
    <Tabs defaultValue="routes">
        <div className="flex justify-center mb-4">
            <TabsList>
            <TabsTrigger value="routes">Gestionar Rutas</TabsTrigger>
            <TabsTrigger value="alerts">Gestionar Alertas</TabsTrigger>
            <TabsTrigger value="drivers">Gestionar Choferes</TabsTrigger>
            </TabsList>
        </div>
        <TabsContent value="routes">
            <RoutesManager routes={routes} onDataChange={refreshData} />
        </TabsContent>
        <TabsContent value="alerts">
            <AlertsManager alerts={alerts} onDataChange={refreshData} />
        </TabsContent>
        <TabsContent value="drivers">
            <DriversManager drivers={drivers} routes={routes} onDataChange={refreshData} />
        </TabsContent>
    </Tabs>
  );
}
