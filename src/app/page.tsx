import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { RoutesSection } from "@/components/sections/RoutesSection";
import { AlertsSection } from "@/components/sections/AlertsSection";
import { HistorySection } from "@/components/sections/HistorySection";
import { ContactSection } from "@/components/sections/ContactSection";
import { getRoutes, getAlerts } from "@/lib/data-service";

export default async function Home() {
  const routes = await getRoutes();
  const alerts = await getAlerts();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <RoutesSection initialRoutes={routes} />
        <AlertsSection initialAlerts={alerts} />
        <HistorySection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
