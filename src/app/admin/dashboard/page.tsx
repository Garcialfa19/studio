
import { getRoutes, getAlerts, getDrivers } from "@/lib/data-service";
import AdminDashboardClient from "@/components/admin/AdminDashboardClient";

export default async function DashboardPage() {
  const routes = await getRoutes();
  const alerts = await getAlerts();
  const drivers = await getDrivers();

  return <AdminDashboardClient initialData={{ routes, alerts, drivers }} />;
}
