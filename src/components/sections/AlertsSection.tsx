
"use client";

import { useEffect, useState } from 'react';
import { Info, BellRing } from 'lucide-react';
import { Alert as AlertUI, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Section, SectionHeader } from "@/components/shared/Section";
import type { Alert } from "@/lib/definitions";
import { Card } from '../ui/card';
import { useData } from '@/lib/data-service';
import { Skeleton } from '../ui/skeleton';

export function AlertsSection() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const { getAlerts } = useData();

  useEffect(() => {
    async function loadAlerts() {
      setLoading(true);
      const fetchedAlerts = await getAlerts();
      setAlerts(fetchedAlerts);
      setLoading(false);
    }
    loadAlerts();
  }, [getAlerts]);

  return (
    <Section id="alertas">
      <SectionHeader title="Alertas y Anuncios" />
      
      {loading ? (
        <Card className="max-w-2xl mx-auto p-6 space-y-4">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-5/6" />
          <Skeleton className="h-6 w-full" />
        </Card>
      ) : alerts.length > 0 ? (
        <Card className="max-w-2xl mx-auto">
            <ul className="p-6 space-y-4">
            {alerts.map(alert => (
                <li key={alert.id} className="flex items-start gap-4">
                    <Info className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <p className="text-foreground">{alert.titulo}</p>
                </li>
            ))}
            </ul>
        </Card>
      ) : (
        <div className="text-center py-12 bg-card rounded-lg shadow-sm">
          <BellRing className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-lg text-muted-foreground">No hay alertas activas en este momento.</p>
          <p className="text-sm text-muted-foreground">¡Buen viaje!</p>
        </div>
      )}
    </Section>
  );
}
