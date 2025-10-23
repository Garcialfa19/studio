
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HistorySection } from "@/components/sections/HistorySection";

export default function HistoriaPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HistorySection />
      </main>
      <Footer />
    </div>
  );
}
