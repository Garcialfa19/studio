"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RoutesManager from "@/components/admin/RoutesManager";
import AlertsManager from "@/components/admin/AlertsManager";
import type { Route, Alert } from "@/lib/definitions";

type AdminDashboardProps = {
  initialRoutes: Route[];
  initialAlerts: Alert[];
};

export default function AdminDashboard({ initialRoutes, initialAlerts }: AdminDashboardProps) {
  return (
    <Tabs defaultValue="routes">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="routes">Gestionar Rutas</TabsTrigger>
        <TabsTrigger value="alerts">Gestionar Alertas</TabsTrigger>
      </TabsList>
      <TabsContent value="routes">
        <RoutesManager routes={initialRoutes} />
      </TabsContent>
      <TabsContent value="alerts">
        <AlertsManager alerts={initialAlerts} />
      </TabsContent>
    </Tabs>
  );
}
