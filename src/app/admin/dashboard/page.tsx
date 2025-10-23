import AdminDashboard from "@/components/admin/AdminDashboard";
import { getRoutes, getAlerts } from "@/lib/data-service";
import { logout } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import Link from "next/link";

export default async function DashboardPage() {
  const routes = await getRoutes();
  const alerts = await getAlerts();

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
          <Link href="/">
            <Logo />
          </Link>
          <h1 className="text-xl font-bold font-headline tracking-tight">Panel de Administración</h1>
          <div className="ml-auto flex items-center gap-2">
              <form action={logout}>
                  <Button variant="outline" size="sm" type="submit">
                      <LogOut className="h-4 w-4 mr-2" />
                      Cerrar Sesión
                  </Button>
              </form>
          </div>
      </header>
      <main className="p-4 sm:px-6 sm:py-0">
        <AdminDashboard initialRoutes={routes} initialAlerts={alerts} />
      </main>
    </div>
  );
}
