"use client";

import { useState, useMemo } from "react";
import { Bus, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Section, SectionHeader } from "@/components/shared/Section";
import { ScheduleModal } from "@/components/shared/ScheduleModal";
import type { Route } from "@/lib/definitions";
import { PlaceHolderImages } from "@/lib/placeholder-images";

type RoutesSectionProps = {
  initialRoutes: Route[];
};

export function RoutesSection({ initialRoutes }: RoutesSectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);

  const filteredRoutes = useMemo(() => {
    return initialRoutes.filter(
      (route) =>
        route.activo &&
        route.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [initialRoutes, searchTerm]);
  
  const scheduleImages = PlaceHolderImages.filter(img => img.id.startsWith('schedule-'));

  const getImageUrl = (route: Route) => {
    const foundImage = PlaceHolderImages.find(img => img.id === route.imagenHorarioUrl);
    if (foundImage) {
      return foundImage.imageUrl;
    }
    // Fallback to a generic placeholder if not found
    return scheduleImages[0]?.imageUrl || "https://picsum.photos/seed/default/800/1200";
  }

  return (
    <Section id="rutas" className="bg-card">
      <SectionHeader
        title="Nuestras Rutas"
        description="Encuentra la información de horarios, tarifas y duración de todas nuestras rutas disponibles."
      />

      <div className="mb-8 max-w-md mx-auto">
        <Input
          type="text"
          placeholder="Buscar ruta por nombre (ej. 'Grecia', 'Sarchí')"
          className="w-full text-center"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredRoutes.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRoutes.map((route) => (
            <Card
              key={route.id}
              className="flex flex-col cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1"
              onClick={() => setSelectedRoute(route)}
              onKeyDown={(e) => e.key === 'Enter' && setSelectedRoute(route)}
              tabIndex={0}
              role="button"
              aria-label={`Ver horario de ${route.nombre}`}
            >
              <CardHeader>
                <CardTitle className="font-headline text-xl">{route.nombre}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-end">
                <div className="flex items-center justify-between text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <span>{route.duracionMin} min</span>
                  </div>
                  <Badge variant="secondary" className="text-lg font-bold text-primary">
                    ₡{route.tarifaCRC.toLocaleString('es-CR')}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Bus className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-lg text-muted-foreground">No se encontraron rutas con ese nombre.</p>
        </div>
      )}

      <ScheduleModal
        route={selectedRoute}
        isOpen={!!selectedRoute}
        onOpenChange={(open) => !open && setSelectedRoute(null)}
        imageUrl={selectedRoute ? getImageUrl(selectedRoute) : ''}
      />
    </Section>
  );
}
