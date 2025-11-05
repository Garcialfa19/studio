"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { saveRoute, deleteRoute } from "@/lib/actions";

const routeSchema = z.object({
  id: z.string().optional(),
  nombre: z.string().min(1, "El nombre es requerido."),
  category: z.enum(["grecia", "sarchi"], { required_error: "La categoría es requerida."}),
  duracionMin: z.coerce.number().min(1, "La duración debe ser positiva."),
  tarifaCRC: z.coerce.number().min(0, "La tarifa no puede ser negativa."),
  imagenHorarioUrl: z.string().optional(),
  imagenTarjetaUrl: z.string().optional(),
  activo: z.boolean(),
});

type RouteFormValues = z.infer<typeof routeSchema>;

const RouteForm = ({ route, onSave, onOpenChange }: { route: Partial<Route> | null, onSave: () => void, onOpenChange: (open: boolean) => void }) => {
  const { toast } = useToast();
  const form = useForm<RouteFormValues>({
    resolver: zodResolver(routeSchema),
    defaultValues: {
      id: route?.id || "",
      nombre: route?.nombre || "",
      category: route?.category || "grecia",
      duracionMin: route?.duracionMin || 0,
      tarifaCRC: route?.tarifaCRC || 0,
      imagenHorarioUrl: route?.imagenHorarioUrl || "",
      imagenTarjetaUrl: route?.imagenTarjetaUrl || "",
      activo: route?.activo ?? true,
    },
  });

  const { formState } = form;

  async function onSubmit(data: RouteFormValues) {
    try {
      await saveRoute(data);
      toast({ title: "Ruta guardada", description: "La ruta se ha guardado correctamente." });
      onSave();
      onOpenChange(false);
    } catch (error) {
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
         <FormField control={form.control} name="category" render={({ field }) => (
          <FormItem><FormLabel>Categoría</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl><SelectTrigger><SelectValue placeholder="Selecciona una categoría"/></SelectTrigger></FormControl>
              <SelectContent>
                <SelectItem value="grecia">Grecia</SelectItem>
                <SelectItem value="sarchi">Sarchí</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>La sección donde aparecerá esta ruta.</FormDescription>
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
         <FormField
          control={form.control}
          name="imagenHorarioUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL de Imagen del Horario</FormLabel>
              <FormControl>
                <Input {...field} placeholder="https://example.com/horario.jpg"/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="imagenTarjetaUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL de Imagen de la Tarjeta</FormLabel>
              <FormControl>
                <Input {...field} placeholder="https://example.com/tarjeta.jpg" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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

export default function RoutesManager({ routes, onDataChange }: { routes: Route[], onDataChange: () => void }) {
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
    try {
      await deleteRoute(id);
      toast({ title: "Ruta eliminada", description: "La ruta se ha eliminado correctamente." });
      onDataChange();
    } catch (error) {
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
              <TableHead>Categoría</TableHead>
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
                <TableCell className="capitalize">{route.category}</TableCell>
                <TableCell>{route.duracionMin} min</TableCell>
                <TableCell>₡{route.tarifaCRC}</TableCell>
                <TableCell>
                  <Badge variant={route.activo ? "default" : "outline"} className={route.activo ? 'bg-green-500' : ''}>{route.activo ? 'Activa' : 'Inactiva'}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end items-center">
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
                  </div>
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
          <RouteForm route={selectedRoute} onSave={onDataChange} onOpenChange={setIsDialogOpen} />
        </DialogContent>
      </Dialog>
    </Card>
  );
}
