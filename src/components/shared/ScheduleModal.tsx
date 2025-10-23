"use client";

import Image from "next/image";
import { useState } from "react";
import { ZoomIn, ZoomOut, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Route } from "@/lib/definitions";

type ScheduleModalProps = {
  route: Route | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
};

export function ScheduleModal({ route, isOpen, onOpenChange, imageUrl }: ScheduleModalProps) {
  const [scale, setScale] = useState(1);

  if (!route) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0">
        <DialogHeader className="flex flex-row items-center justify-between p-4 border-b">
          <DialogTitle className="font-headline text-lg">{route.nombre}</DialogTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setScale(s => Math.min(s + 0.2, 3))}>
              <ZoomIn className="h-5 w-5" />
              <span className="sr-only">Acercar</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setScale(s => Math.max(s - 0.2, 0.5))}>
              <ZoomOut className="h-5 w-5" />
              <span className="sr-only">Alejar</span>
            </Button>
            <DialogClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-5 w-5" />
                <span className="sr-only">Cerrar</span>
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>
        <div className="overflow-auto p-4 bg-muted/50">
           <div className="overflow-hidden flex justify-center items-start">
             <Image
                src={imageUrl}
                alt={`Horario de la ruta ${route.nombre}`}
                width={800}
                height={1200}
                className="transition-transform duration-300 ease-in-out"
                style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
                data-ai-hint="bus schedule"
              />
           </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
