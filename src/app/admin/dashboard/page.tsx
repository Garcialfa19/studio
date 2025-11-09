'use client';

import AdminDashboardClient from "@/components/admin/AdminDashboardClient";
import withAuth from "@/components/admin/withAuth";

const ProtectedDashboard = withAuth(AdminDashboardClient);

export default function AdminDashboardPage() {
    return <ProtectedDashboard />;
}
