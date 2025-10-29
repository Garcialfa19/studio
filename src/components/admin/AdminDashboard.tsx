"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RoutesManager from "@/components/admin/RoutesManager";
import AlertsManager from "@/components/admin/AlertsManager";
import DriversManager from "@/components/admin/DriversManager";
import UsersManager from "@/components/admin/UsersManager";
import type { Route, Alert, Driver } from "@/lib/definitions";

type AdminDashboardProps = {
  initialRoutes: Route[];
  initialAlerts: Alert[];
  initialDrivers: Driver[];
};

export default function AdminDashboard({ initialRoutes, initialAlerts, initialDrivers }: AdminDashboardProps) {
  return (
    <Tabs defaultValue="routes">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="routes">Gestionar Rutas</TabsTrigger>
        <TabsTrigger value="alerts">Gestionar Alertas</TabsTrigger>
        <TabsTrigger value="drivers">Gestionar Choferes</TabsTrigger>
        <TabsTrigger value="users">Gestionar Usuarios</TabsTrigger>
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
       <TabsContent value="users">
        <UsersManager />
      </TabsContent>
    </Tabs>
  );
}
