"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RoutesManager from "@/components/admin/RoutesManager";
import AlertsManager from "@/components/admin/AlertsManager";
import DriversManager from "@/components/admin/DriversManager";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "../ui/skeleton";
import type { Route, Alert, Driver } from "@/lib/definitions";
import { useEffect } from "react";
import routesData from '@/data/routes.json';
import alertsData from '@/data/alerts.json';
import driversData from '@/data/drivers.json';

export default function AdminDashboard() {
    const [routes, setRoutes] = useState<Route[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        setRoutes(routesData as Route[]);
        setAlerts(alertsData as Alert[]);
        setDrivers(driversData as Driver[]);
        setLoading(false);
    }, []);


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
