
"use client";

import withAuth from "@/components/admin/withAuth";
import AdminDashboardClient from "@/components/admin/AdminDashboardClient";
import type { Route, Alert, Driver } from "@/lib/definitions";

// Define the type for the props the component will receive
type PageClientProps = {
  initialData: {
    routes: Route[];
    alerts: Alert[];
    drivers: Driver[];
  };
};

// Apply the withAuth HOC to the component that needs protection
const AuthenticatedDashboard = withAuth(AdminDashboardClient);

// This is the top-level client component rendered by the server page
export default function AdminDashboardPageClient({ initialData }: PageClientProps) {
  // Pass the server-fetched data down to the authenticated component
  return <AuthenticatedDashboard initialData={initialData} />;
}
