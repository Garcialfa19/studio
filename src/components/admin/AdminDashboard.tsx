"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RoutesManager from "@/components/admin/RoutesManager";
import AlertsManager from "@/components/admin/AlertsManager";
import DriversManager from "@/components/admin/DriversManager";
import type { Route, Alert, Driver } from "@/lib/definitions";

type AdminDashboardProps = {
  initialRoutes: Route[];
  initialAlerts: Alert[];
  initialDrivers: Driver[];
};

export default function AdminDashboard({ initialRoutes, initialAlerts, initialDrivers }: AdminDashboardProps) {
  return (
    <Tabs defaultValue="routes">
      <TabsList>
        <TabsTrigger value="routes">Gestionar Rutas</TabsTrigger>
        <TabsTrigger value="alerts">Gestionar Alertas</TabsTrigger>
        <TabsTrigger value="drivers">Gestionar Choferes</TabsTrigger>
      </TabsList>
      <TabsContent value="routes">
        <RoutesManager routes={initialRoutes} />
      </TabsContent>
      <TabsContent value="alerts">
        <AlertsManager alerts={initialAlerts} />
      </TabsContent>
      <TabsContent value="drivers">
        <DriversManager drivers={initialDrivers} routes={initialRoutes} />
      </TabsContent>
    </Tabs>
  );
}
