"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { saveRoute, deleteRoute } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Edit, Trash2, ExternalLink } from "lucide-react";
import type { Route } from "@/lib/definitions";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const routeSchema = z.object({
  id: z.string().optional(),
  nombre: z.string().min(1, "El nombre es requerido."),
  duracionMin: z.coerce.number().min(1, "La duración debe ser positiva."),
  tarifaCRC: z.coerce.number().min(0, "La tarifa no puede ser negativa."),
  imagenHorarioUrl: z.string().min(1, "Se requiere el ID de la imagen de placeholder (ej: 'schedule-placeholder-1')."),
  activo: z.boolean(),
});

type RouteFormValues = z.infer<typeof routeSchema>;

const RouteForm = ({ route, onOpenChange }: { route: Partial<Route> | null, onOpenChange: (open: boolean) => void }) => {
  const { toast } = useToast();
  const form = useForm<RouteFormValues>({
    resolver: zodResolver(routeSchema),
    defaultValues: {
      id: route?.id || "",
      nombre: route?.nombre || "",
      duracionMin: route?.duracionMin || 0,
      tarifaCRC: route?.tarifaCRC || 0,
      imagenHorarioUrl: route?.imagenHorarioUrl || "",
      activo: route?.activo ?? true,
    },
  });

  const { formState } = form;

  async function onSubmit(data: RouteFormValues) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, String(value));
    });

    const result = await saveRoute(formData);
    if (result.success) {
      toast({ title: "Ruta guardada", description: "La ruta se ha guardado correctamente." });
      onOpenChange(false);
    } else {
      toast({ variant: "destructive", title: "Error", description: "No se pudo guardar la ruta." });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="nombre" render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre de la Ruta</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="duracionMin" render={({ field }) => (
            <FormItem>
              <FormLabel>Duración (min)</FormLabel>
              <FormControl><Input type="number" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="tarifaCRC" render={({ field }) => (
            <FormItem>
              <FormLabel>Tarifa (₡)</FormLabel>
              <FormControl><Input type="number" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <FormField control={form.control} name="imagenHorarioUrl" render={({ field }) => (
          <FormItem>
            <FormLabel>ID de Imagen de Horario</FormLabel>
            <FormControl><Input {...field} placeholder="ej. schedule-placeholder-1" /></FormControl>
             <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="activo" render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
            <div className="space-y-0.5">
              <FormLabel>Activa</FormLabel>
            </div>
            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
          </FormItem>
        )} />
        <DialogFooter>
          <DialogClose asChild><Button type="button" variant="secondary">Cancelar</Button></DialogClose>
          <Button type="submit" disabled={formState.isSubmitting}>{formState.isSubmitting ? 'Guardando...' : 'Guardar'}</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default function RoutesManager({ routes }: { routes: Route[] }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Partial<Route> | null>(null);
  const { toast } = useToast();

  const handleEdit = (route: Route) => {
    setSelectedRoute(route);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setSelectedRoute({});
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const result = await deleteRoute(id);
    if (result.success) {
      toast({ title: "Ruta eliminada", description: "La ruta se ha eliminado correctamente." });
    } else {
      toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar la ruta." });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Rutas</CardTitle>
            <CardDescription>Crea, edita y elimina las rutas de la empresa.</CardDescription>
          </div>
          <Button onClick={handleAddNew}><PlusCircle className="mr-2 h-4 w-4" /> Nueva Ruta</Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Duración</TableHead>
              <TableHead>Tarifa</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {routes.map((route) => (
              <TableRow key={route.id}>
                <TableCell className="font-medium">{route.nombre}</TableCell>
                <TableCell>{route.duracionMin} min</TableCell>
                <TableCell>₡{route.tarifaCRC}</TableCell>
                <TableCell>
                  <Badge variant={route.activo ? "default" : "outline"} className={route.activo ? 'bg-green-500' : ''}>{route.activo ? 'Activa' : 'Inactiva'}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(route)}><Edit className="h-4 w-4" /></Button>
                  <a href={`/#rutas`} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="icon"><ExternalLink className="h-4 w-4" /></Button>
                  </a>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción no se puede deshacer. Esto eliminará permanentemente la ruta.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(route.id)} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedRoute?.id ? 'Editar Ruta' : 'Nueva Ruta'}</DialogTitle>
          </DialogHeader>
          <RouteForm route={selectedRoute} onOpenChange={setIsDialogOpen} />
        </DialogContent>
      </Dialog>
    </Card>
  );
}
