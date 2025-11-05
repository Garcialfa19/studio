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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import type { Driver, Route } from "@/lib/definitions";
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
} from "@/components/ui/alert-dialog";

const driverSchema = z.object({
  id: z.string().optional(),
  nombre: z.string().min(1, "El nombre es requerido."),
  busPlate: z.string().optional(),
  routeId: z.string().nullable(),
  status: z.string().optional(),
  comment: z.string().optional(),
});

type DriverFormValues = z.infer<typeof driverSchema>;

const DriverForm = ({ driver, routes, onOpenChange }: { driver: Partial<Driver> | null, routes: Route[], onOpenChange: (open: boolean) => void }) => {
  const { toast } = useToast();
  const form = useForm<DriverFormValues>({
    resolver: zodResolver(driverSchema),
    defaultValues: {
      id: driver?.id || "",
      nombre: driver?.nombre || "",
      busPlate: driver?.busPlate || "",
      routeId: driver?.routeId || null,
      status: driver?.status || "",
      comment: driver?.comment || "",
    },
  });

  const { formState } = form;

  async function onSubmit(data: DriverFormValues) {
    // This is a placeholder for the actual save action
    console.log(data);
    toast({ title: "Chofer guardado", description: "La información del chofer se ha guardado." });
    onOpenChange(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="nombre" render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre del Chofer</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        
        <FormField control={form.control} name="busPlate" render={({ field }) => (
          <FormItem>
            <FormLabel>Placa del Bus</FormLabel>
            <FormControl><Input {...field} placeholder="Ej: AB 1234" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="routeId" render={({ field }) => (
          <FormItem>
            <FormLabel>Ruta Asignada</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ''} defaultValue={field.value || ''}>
              <FormControl><SelectTrigger><SelectValue placeholder="Seleccione una ruta" /></SelectTrigger></FormControl>
              <SelectContent>
                <SelectItem value="null">Sin asignar</SelectItem>
                {routes.map(route => (
                  <SelectItem key={route.id} value={route.id}>{route.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="status" render={({ field }) => (
          <FormItem>
            <FormLabel>Estado</FormLabel>
            <FormControl><Input {...field} placeholder="Ej: En ruta, Descanso, Taller..." /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="comment" render={({ field }) => (
          <FormItem>
            <FormLabel>Comentario (Opcional)</FormLabel>
            <FormControl><Textarea {...field} placeholder="Añade un comentario..." /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <DialogFooter>
          <DialogClose asChild><Button type="button" variant="secondary">Cancelar</Button></DialogClose>
          <Button type="submit" disabled={formState.isSubmitting}>
            {formState.isSubmitting ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default function DriversManager({ drivers, routes }: { drivers: Driver[], routes: Route[] }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Partial<Driver> | null>(null);
  const { toast } = useToast();

  const handleEdit = (driver: Driver) => {
    setSelectedDriver(driver);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setSelectedDriver({});
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    // This is a placeholder for the actual delete action
    console.log(`Deleting driver ${id}`);
    toast({ title: "Chofer eliminado", description: "El chofer se ha eliminado." });
  };
  
  const getRouteName = (routeId: string | null) => {
    if (!routeId) return <span className="text-muted-foreground">Sin asignar</span>;
    return routes.find(r => r.id === routeId)?.nombre || <span className="text-destructive">Ruta desconocida</span>;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Choferes</CardTitle>
          <CardDescription>Asigna choferes a rutas y monitorea su estado.</CardDescription>
        </div>
        <Button onClick={handleAddNew}><PlusCircle className="mr-2 h-4 w-4" /> Nuevo Chofer</Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Placa del Bus</TableHead>
              <TableHead>Ruta Asignada</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Comentario</TableHead>
              <TableHead className="text-right w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {drivers.map((driver) => (
              <TableRow key={driver.id}>
                <TableCell className="font-medium">{driver.nombre}</TableCell>
                <TableCell>{driver.busPlate}</TableCell>
                <TableCell>{getRouteName(driver.routeId)}</TableCell>
                <TableCell>{driver.status}</TableCell>
                <TableCell className="max-w-[200px] truncate">{driver.comment}</TableCell>
                <TableCell>
                    <div className="flex justify-end items-center">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(driver)}><Edit className="h-4 w-4" /></Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                Esta acción no se puede deshacer. Esto eliminará permanentemente al chofer.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(driver.id)} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
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
            <DialogTitle>{selectedDriver?.id ? 'Editar Chofer' : 'Nuevo Chofer'}</DialogTitle>
          </DialogHeader>
          <DriverForm driver={selectedDriver} routes={routes} onOpenChange={setIsDialogOpen} />
        </DialogContent>
      </Dialog>
    </Card>
  );
}
