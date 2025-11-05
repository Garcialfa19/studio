"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { Bus, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Section, SectionHeader } from "@/components/shared/Section";
import { ScheduleModal } from "@/components/shared/ScheduleModal";
import type { Route } from "@/lib/definitions";
import { Separator } from "../ui/separator";
import { Skeleton } from "../ui/skeleton";
import routesData from '@/data/routes.json';

export function RoutesSection() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    setRoutes(routesData as Route[]);
    setLoading(false);
  }, []);

  const greciaRoutes = useMemo(() => {
    return routes.filter(
      (route) => route.activo && route.category === 'grecia'
    );
  }, [routes]);
  
  const sarchiRoutes = useMemo(() => {
    return routes.filter(
      (route) => route.activo && route.category === 'sarchi'
    );
  }, [routes]);
  
  const RouteGridSkeleton = () => (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="flex flex-col">
           <div className="relative aspect-[16/10] w-full p-4">
              <Skeleton className="h-full w-full rounded-md" />
           </div>
           <CardContent className="p-4 pt-0">
             <Skeleton className="h-8 w-3/4 mb-2" />
             <Skeleton className="h-4 w-1/2 mb-3" />
             <Separator className="mb-3" />
             <div className="flex items-center justify-between mt-auto">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-8 w-16" />
             </div>
           </CardContent>
        </Card>
      ))}
    </div>
  )

  const RouteGrid = ({ routes }: { routes: Route[] }) => {
    if (routes.length === 0) {
      return (
         <div className="text-center py-12">
          <Bus className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-lg text-muted-foreground">No se encontraron rutas activas.</p>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {routes.map((route) => (
            <Card
              key={route.id}
              className="overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 flex flex-col"
              onClick={() => setSelectedRoute(route)}
              onKeyDown={(e) => e.key === 'Enter' && setSelectedRoute(route)}
              tabIndex={0}
              role="button"
              aria-label={`Ver horario de ${route.nombre}`}
            >
              <div className="relative aspect-[16/10] w-full p-4">
                <Image
                    src={route.imagenTarjetaUrl || "https://placehold.co/600x400/EEE/31343C"}
                    alt={`Autobús de la ruta ${route.nombre}`}
                    fill
                    className="object-cover rounded-md"
                    data-ai-hint="transport bus"
                />
              </div>
              <CardContent className="p-4 pt-0 flex flex-col flex-grow">
                <h3 className="font-headline text-2xl font-bold">{route.nombre}</h3>
                <p className="text-muted-foreground mb-3">Por Churuca</p>
                <Separator className="mb-3" />
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Bus className="h-5 w-5 text-primary" />
                    <span>{route.duracionMin} Min</span>
                  </div>
                  <span className="text-lg font-bold text-foreground">
                    ₡{route.tarifaCRC}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
    )
  }

  return (
    <Section id="rutas" className="bg-card">
      <SectionHeader
        title="Grecia"
        className="text-left mb-6"
      />
      <Separator className="mb-8" />
       {loading ? <RouteGridSkeleton /> : <RouteGrid routes={greciaRoutes} />}

      <SectionHeader
        title="Sarchí"
        className="text-left mb-6 mt-16"
      />
      <Separator className="mb-8" />
      {loading ? <RouteGridSkeleton /> : <RouteGrid routes={sarchiRoutes} />}

      <ScheduleModal
        route={selectedRoute}
        isOpen={!!selectedRoute}
        onOpenChange={(open) => !open && setSelectedRoute(null)}
        imageUrl={selectedRoute?.imagenHorarioUrl || ''}
      />
    </Section>
  );
}
