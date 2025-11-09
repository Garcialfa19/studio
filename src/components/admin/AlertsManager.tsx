
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Trash2 } from "lucide-react";
import type { Alert } from "@/lib/definitions";
import { useToast } from "@/components/ui/use-toast";
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
import { dataService } from "@/lib/data-service-client";

const alertSchema = z.object({
  id: z.string().optional(),
  titulo: z.string().min(1, "El título es requerido."),
});

type AlertFormValues = z.infer<typeof alertSchema>;

const AlertForm = ({ onSave, onOpenChange }: { onSave: () => void, onOpenChange: (open: boolean) => void }) => {
  const { toast } = useToast();
  const form = useForm<AlertFormValues>({
    resolver: zodResolver(alertSchema),
    defaultValues: {
      id: "",
      titulo: "",
    },
  });

  const { formState } = form;

  async function onSubmit(data: AlertFormValues) {
    try {
      await dataService.addAlert({ titulo: data.titulo });
      toast({ title: "Alerta guardada", description: "La alerta se ha guardado correctamente." });
      onSave();
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo guardar la alerta." });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="titulo" render={({ field }) => (
          <FormItem><FormLabel>Título</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <DialogFooter>
          <DialogClose asChild><Button type="button" variant="secondary">Cancelar</Button></DialogClose>
          <Button type="submit" disabled={formState.isSubmitting}>{formState.isSubmitting ? 'Guardando...' : 'Guardar'}</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default function AlertsManager({ alerts, onDataChange }: { alerts: Alert[], onDataChange: () => void }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleAddNew = () => {
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await dataService.deleteAlert(id);
      toast({ title: "Alerta eliminada", description: "La alerta se ha eliminado." });
      onDataChange();
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar la alerta." });
    }
  };

  return (
    <Card>
       <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Alertas</CardTitle>
            <CardDescription>Gestiona las alertas y anuncios para los usuarios.</CardDescription>
          </div>
          <Button onClick={handleAddNew}><PlusCircle className="mr-2 h-4 w-4" /> Nueva Alerta</Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead className="text-right w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alerts.map((alert) => (
              <TableRow key={alert.id}>
                <TableCell className="font-medium">{alert.titulo}</TableCell>
                <TableCell>
                  <div className="flex justify-end items-center">
                    <AlertDialog>
                      <AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>¿Estás seguro?</AlertDialogTitle><AlertDialogDescription>Esta acción no se puede deshacer. Esto eliminará la alerta.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(alert.id)} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction></AlertDialogFooter>
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
          <DialogHeader><DialogTitle>Nueva Alerta</DialogTitle></DialogHeader>
          <AlertForm onSave={onDataChange} onOpenChange={setIsDialogOpen} />
        </DialogContent>
      </Dialog>
    </Card>
  );
}
