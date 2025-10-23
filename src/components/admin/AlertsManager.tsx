"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { saveAlert, deleteAlert } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import type { Alert } from "@/lib/definitions";
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
import { format } from "date-fns";

const alertSchema = z.object({
  id: z.string().optional(),
  titulo: z.string().min(1, "El título es requerido."),
  mensaje: z.string().min(1, "El mensaje es requerido."),
  severidad: z.enum(["info", "warning", "critical"]),
  iniciaISO: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Fecha de inicio inválida." }),
  terminaISO: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Fecha de fin inválida." }),
  activo: z.boolean(),
});

type AlertFormValues = z.infer<typeof alertSchema>;

const AlertForm = ({ alert, onOpenChange }: { alert: Partial<Alert> | null, onOpenChange: (open: boolean) => void }) => {
  const { toast } = useToast();
  const form = useForm<AlertFormValues>({
    resolver: zodResolver(alertSchema),
    defaultValues: {
      id: alert?.id || "",
      titulo: alert?.titulo || "",
      mensaje: alert?.mensaje || "",
      severidad: alert?.severidad || "info",
      iniciaISO: alert?.iniciaISO ? format(new Date(alert.iniciaISO), "yyyy-MM-dd'T'HH:mm") : "",
      terminaISO: alert?.terminaISO ? format(new Date(alert.terminaISO), "yyyy-MM-dd'T'HH:mm") : "",
      activo: alert?.activo ?? true,
    },
  });

  const { formState } = form;

  async function onSubmit(data: AlertFormValues) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
        // Format dates back to ISO string with seconds and Z
        if (key === 'iniciaISO' || key === 'terminaISO') {
            formData.append(key, new Date(value).toISOString());
        } else {
            formData.append(key, String(value));
        }
    });

    const result = await saveAlert(formData);
    if (result.success) {
      toast({ title: "Alerta guardada", description: "La alerta se ha guardado correctamente." });
      onOpenChange(false);
    } else {
      toast({ variant: "destructive", title: "Error", description: "No se pudo guardar la alerta." });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="titulo" render={({ field }) => (
          <FormItem><FormLabel>Título</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="mensaje" render={({ field }) => (
          <FormItem><FormLabel>Mensaje</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="severidad" render={({ field }) => (
          <FormItem><FormLabel>Severidad</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
              <SelectContent>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select><FormMessage /></FormItem>
        )} />
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="iniciaISO" render={({ field }) => (
            <FormItem><FormLabel>Inicia</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="terminaISO" render={({ field }) => (
            <FormItem><FormLabel>Termina</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <FormField control={form.control} name="activo" render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
            <div className="space-y-0.5"><FormLabel>Activa</FormLabel></div>
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

export default function AlertsManager({ alerts }: { alerts: Alert[] }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Partial<Alert> | null>(null);
  const { toast } = useToast();

  const handleEdit = (alert: Alert) => {
    setSelectedAlert(alert);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setSelectedAlert({});
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const result = await deleteAlert(id);
    if (result.success) {
      toast({ title: "Alerta eliminada", description: "La alerta se ha eliminado." });
    } else {
      toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar la alerta." });
    }
  };
  
  const isAlertCurrentlyActive = (alert: Alert) => {
    const now = new Date();
    return alert.activo && new Date(alert.iniciaISO) <= now && new Date(alert.terminaISO) >= now;
  }

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
              <TableHead>Severidad</TableHead>
              <TableHead>Periodo de Actividad</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alerts.map((alert) => (
              <TableRow key={alert.id}>
                <TableCell className="font-medium">{alert.titulo}</TableCell>
                <TableCell><Badge variant="outline">{alert.severidad}</Badge></TableCell>
                <TableCell>{`${format(new Date(alert.iniciaISO), 'dd/MM/yy HH:mm')} - ${format(new Date(alert.terminaISO), 'dd/MM/yy HH:mm')}`}</TableCell>
                <TableCell>
                  <Badge variant={isAlertCurrentlyActive(alert) ? "default" : "secondary"} className={isAlertCurrentlyActive(alert) ? 'bg-green-500' : ''}>
                    {isAlertCurrentlyActive(alert) ? 'Visible' : 'No Visible'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(alert)}><Edit className="h-4 w-4" /></Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader><AlertDialogTitle>¿Estás seguro?</AlertDialogTitle><AlertDialogDescription>Esta acción no se puede deshacer. Esto eliminará la alerta.</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(alert.id)} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction></AlertDialogFooter>
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
          <DialogHeader><DialogTitle>{selectedAlert?.id ? 'Editar Alerta' : 'Nueva Alerta'}</DialogTitle></DialogHeader>
          <AlertForm alert={selectedAlert} onOpenChange={setIsDialogOpen} />
        </DialogContent>
      </Dialog>
    </Card>
  );
}
