"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RoutesManager from "@/components/admin/RoutesManager";
import AlertsManager from "@/components/admin/AlertsManager";
import DriversManager from "@/components/admin/DriversManager";
import type { Route, Alert, Driver } from "@/lib/definitions";
import { DataMigration } from "./DataMigration";
import { useData } from "@/lib/data-service";
import { Skeleton } from "../ui/skeleton";

export default function AdminDashboard() {
    const [routes, setRoutes] = useState<Route[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);
    const { getRoutes, getAlerts, getDrivers } = useData();

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            const [routesData, alertsData, driversData] = await Promise.all([
                getRoutes(),
                getAlerts(),
                getDrivers(),
            ]);
            setRoutes(routesData);
            setAlerts(alertsData);
            setDrivers(driversData);
            setLoading(false);
        }
        loadData();
    }, [getRoutes, getAlerts, getDrivers]);


  if (loading) {
    return (
        <div className="space-y-4">
          <Skeleton className="h-10 w-96 mx-auto" />
          <DataMigration />
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
        <DataMigration />
        <TabsContent value="routes">
            <RoutesManager routes={routes} />
        </TabsContent>
        <TabsContent value="alerts">
            <AlertsManager alerts={alerts} />
        </TabsContent>
        <TabsContent value="drivers">
            <DriversManager drivers={drivers} routes={routes} />
        </TabsContent>
    </Tabs>
  );
}
