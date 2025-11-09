
'use client';

import { useState, useEffect } from 'react';
import { getRoutes } from '@/lib/data-service-client';
import type { Route } from '@/lib/definitions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScheduleModal } from "@/components/shared/ScheduleModal";

export function RoutesSection() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRoutes() {
      try {
        const fetchedRoutes = await getRoutes();
        setRoutes(fetchedRoutes);
      } catch (err) {
        setError('No se pudieron cargar las rutas.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchRoutes();
  }, []);

  return (
    <section id="rutas" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Nuestras Rutas</h2>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
            Descubre las diferentes rutas que ofrecemos, diseñadas para llevarte a tu destino de forma segura y puntual.
          </p>
        </div>

        {loading && <p className="text-center">Cargando rutas...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {!loading && !error && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {routes.map(route => (
              <Card key={route.id}>
                <img
                  src={route.imagenTarjetaUrl || '/placeholder.svg'}
                  alt={`Imagen de la ruta ${route.nombre}`}
                  width={400}
                  height={250}
                  className="aspect-[4/3] w-full rounded-t-lg object-cover"
                />
                <CardHeader>
                  <CardTitle>{route.nombre}</CardTitle>
                  <CardDescription>{route.especificacion}</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Duración: {route.duracionMin} min</p>
                    <p className="font-bold">₡{route.tarifaCRC}</p>
                  </div>
                  <ScheduleModal route={route} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
