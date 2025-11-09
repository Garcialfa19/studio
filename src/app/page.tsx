
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { RoutesSection } from "@/components/sections/RoutesSection";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <RoutesSection />
      </main>
      <Footer />
    </div>
  );
}
