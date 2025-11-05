
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AlertsSection } from "@/components/sections/AlertsSection";

export default function AlertasPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <AlertsSection />
      </main>
      <Footer />
    </div>
  );
}
