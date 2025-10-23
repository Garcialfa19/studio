
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AlertsSection } from "@/components/sections/AlertsSection";
import { getAlerts } from "@/lib/data-service";

export default async function AlertasPage() {
  const alerts = await getAlerts();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <AlertsSection initialAlerts={alerts} />
      </main>
      <Footer />
    </div>
  );
}
