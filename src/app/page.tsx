
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { RoutesSection } from "@/components/sections/RoutesSection";
import { getRoutes } from "@/lib/data-service";

export default async function Home() {
  const routes = await getRoutes();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <RoutesSection routes={routes} />
      </main>
      <Footer />
    </div>
  );
}
