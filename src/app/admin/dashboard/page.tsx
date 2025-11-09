
import { getRoutes, getAlerts, getDrivers } from "@/lib/data-service";
import AdminDashboardPageClient from "./page.client";

// This is the main Server Component for the page.
export default async function AdminDashboardPage() {
  // 1. Fetch data on the server.
  const routes = await getRoutes();
  const alerts = await getAlerts();
  const drivers = await getDrivers();
  const initialData = { routes, alerts, drivers };

  // 2. Render the top-level Client Component, passing the data as props.
  // The client component will handle authentication and rendering the UI.
  return <AdminDashboardPageClient initialData={initialData} />;
}
