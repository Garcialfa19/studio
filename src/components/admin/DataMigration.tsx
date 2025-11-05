"use client";

import { useState } from "react";
import { migrateDataToFirestore } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Rocket } from "lucide-react";

export function DataMigration() {
  const [isMigrating, setIsMigrating] = useState(false);
  const { toast } = useToast();

  const handleMigration = async () => {
    setIsMigrating(true);
    try {
      const result = await migrateDataToFirestore();
      if (result.success) {
        toast({
          title: "Migración Exitosa",
          description: `${result.message} Se recomienda recargar la página.`,
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error en la Migración",
        description: error.message || "No se pudo completar la migración.",
      });
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <Card className="mb-6 bg-secondary/50 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary"/>
            <span>Utilidad de Migración de Datos</span>
        </CardTitle>
        <CardDescription>
          Presiona este botón una sola vez para mover los datos iniciales de la aplicación a la base de datos de Firebase.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleMigration} disabled={isMigrating}>
          {isMigrating ? "Migrando..." : "Iniciar Migración a Firestore"}
        </Button>
      </CardContent>
    </Card>
  );
}
