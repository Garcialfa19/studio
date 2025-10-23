"use client";

import { useState, useMemo } from 'react';
import { AlertTriangle, Info, BellRing, X } from 'lucide-react';
import { Alert as AlertUI, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Section, SectionHeader } from "@/components/shared/Section";
import type { Alert } from "@/lib/definitions";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type AlertsSectionProps = {
  initialAlerts: Alert[];
};

const severityConfig = {
  info: { icon: Info, color: "text-blue-500", bgColor: "bg-blue-50" },
  warning: { icon: AlertTriangle, color: "text-yellow-500", bgColor: "bg-yellow-50" },
  critical: { icon: BellRing, color: "text-red-500", bgColor: "bg-red-50" },
};

export function AlertsSection({ initialAlerts }: AlertsSectionProps) {
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  const activeAlerts = useMemo(() => {
    const now = new Date();
    return initialAlerts
      .filter(alert => {
        const startDate = new Date(alert.iniciaISO);
        const endDate = new Date(alert.terminaISO);
        return alert.activo && now >= startDate && now <= endDate && !dismissedAlerts.includes(alert.id);
      })
      .sort((a, b) => {
        const severityOrder = { critical: 0, warning: 1, info: 2 };
        return severityOrder[a.severidad] - severityOrder[b.severidad];
      });
  }, [initialAlerts, dismissedAlerts]);

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const startStr = format(startDate, "d 'de' MMMM, h:mm a", { locale: es });
    const endStr = format(endDate, "d 'de' MMMM, h:mm a", { locale: es });
    return `Válido de ${startStr} a ${endStr}`;
  };

  return (
    <Section id="alertas">
      <SectionHeader title="Alertas y Anuncios" />
      
      {activeAlerts.length > 0 ? (
        <div className="space-y-4 max-w-4xl mx-auto">
          {activeAlerts.map(alert => {
            const config = severityConfig[alert.severidad];
            const Icon = config.icon;
            return (
              <AlertUI key={alert.id} className={cn("relative shadow-md border-l-4", {
                "border-red-500": alert.severidad === "critical",
                "border-yellow-500": alert.severidad === "warning",
                "border-blue-500": alert.severidad === "info",
              })}>
                <Icon className={cn("h-5 w-5", config.color)} />
                <AlertTitle className="ml-8 font-headline text-lg flex items-center gap-4">
                  {alert.titulo}
                   <Badge variant={alert.severidad === 'destructive' ? 'destructive' : 'secondary'} className={cn({
                    "bg-red-100 text-red-800": alert.severidad === "critical",
                    "bg-yellow-100 text-yellow-800": alert.severidad === "warning",
                    "bg-blue-100 text-blue-800": alert.severidad === "info",
                   })}>
                    {alert.severidad.charAt(0).toUpperCase() + alert.severidad.slice(1)}
                   </Badge>
                </AlertTitle>
                <AlertDescription className="ml-8">
                  <p className="my-2">{alert.mensaje}</p>
                  <p className="text-xs text-muted-foreground">{formatDateRange(alert.iniciaISO, alert.terminaISO)}</p>
                </AlertDescription>
                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => setDismissedAlerts(prev => [...prev, alert.id])}>
                  <X className="h-4 w-4" />
                  <span className="sr-only">Descartar alerta</span>
                </Button>
              </AlertUI>
            );
          })}
        </div>
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
