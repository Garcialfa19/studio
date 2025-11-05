
"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RoutesManager from "@/components/admin/RoutesManager";
import AlertsManager from "@/components/admin/AlertsManager";
import DriversManager from "@/components/admin/DriversManager";
import { DataMigration } from "@/components/admin/DataMigration";
import type { Route, Alert, Driver } from "@/lib/definitions";

type AdminDashboardProps = {
  initialData: {
    routes: Route[];
    alerts: Alert[];
    drivers: Driver[];
  };
  onDataChange: () => void;
};

export default function AdminDashboard({ initialData, onDataChange }: AdminDashboardProps) {
  return (
    <Tabs defaultValue="routes">
        <div className="flex justify-center mb-4">
            <TabsList>
            <TabsTrigger value="routes">Gestionar Rutas</TabsTrigger>
            <TabsTrigger value="alerts">Gestionar Alertas</TabsTrigger>
            <TabsTrigger value="drivers">Gestionar Choferes</TabsTrigger>
            <TabsTrigger value="migration">Migración</TabsTrigger>
            </TabsList>
        </div>
        <TabsContent value="routes">
            <RoutesManager routes={initialData.routes} onDataChange={onDataChange} />
        </TabsContent>
        <TabsContent value="alerts">
            <AlertsManager alerts={initialData.alerts} onDataChange={onDataChange} />
        </TabsContent>
        <TabsContent value="drivers">
            <DriversManager drivers={initialData.drivers} routes={initialData.routes} onDataChange={onDataChange} />
        </TabsContent>
        <TabsContent value="migration">
            <DataMigration />
        </TabsContent>
    </Tabs>
  );
}
