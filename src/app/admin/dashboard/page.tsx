
'use client';
import { getRoutes, getAlerts, getDrivers } from "@/lib/data-service";
import AdminDashboardClient from "@/components/admin/AdminDashboardClient";

async function getInitialData() {
  const routes = await getRoutes();
  const alerts = await getAlerts();
  const drivers = await getDrivers();
  return { routes, alerts, drivers };
}


export default function Page() {
    // In a real-world scenario, you'd fetch this data.
    // For this implementation, we pass a promise that resolves to the data.
  return <AdminDashboardClient initialDataPromise={getInitialData()} />;
}
