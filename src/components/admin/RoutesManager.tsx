
"use client";

import { useState } from "react";
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
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Edit, Trash2, ExternalLink } from "lucide-react";
import type { Route } from "@/lib/definitions";
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
} from "@/components/ui/alert-dialog"
import { dataService, storageService } from "@/lib/data-service-client";

const RouteForm = ({ route, onSave, onOpenChange }: { route: Partial<Route> | null, onSave: () => void, onOpenChange: (open: boolean) => void }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const form = event.currentTarget;
    const isEditing = !!route?.id;

    let imageUrl = route?.imageUrl || "";
    let imagePath = route?.imagePath || "";

    try {
        if (imageFile) {
            if (isEditing && route.imagePath) {
                await storageService.deleteFile(route.imagePath);
            }
            const { downloadURL, path } = await storageService.uploadFile(imageFile, `routes/${Date.now()}_${imageFile.name}`);
            imageUrl = downloadURL;
            imagePath = path;
        }

        const formData = {
            nombre: form.nombre.value,
            especificacion: form.especificacion.value,
            category: form.category.value,
            duracionMin: Number(form.duracionMin.value),
            tarifaCRC: Number(form.tarifaCRC.value),
            imageUrl,
            imagePath,
        };

      if (isEditing) {
        await dataService.updateRoute(route.id!, formData);
      } else {
        await dataService.addRoute(formData);
      }
      toast({ title: "Ruta guardada", description: "La ruta se ha guardado correctamente." });
      onSave();
      onOpenChange(false);
    } catch (error: any) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: error.message || "No se pudo guardar la ruta." });
    } finally {
      setIsSubmitting(false);
    }
  }

  const isEditing = !!route?.id;

  return (
      <form onSubmit={handleSubmit} className="space-y-4">
        {isEditing && <input type="hidden" name="id" value={route.id} />}
        
        <div className="space-y-2">
            <Label htmlFor="nombre">Nombre de la Ruta</Label>
            <Input id="nombre" name="nombre" defaultValue={route?.nombre || ""} required readOnly={isEditing} />
            {isEditing && <p className="text-xs text-muted-foreground">El nombre no se puede cambiar porque define el ID de la ruta.</p>}
        </div>
        <div className="space-y-2">
            <Label htmlFor="especificacion">Especificación (Opcional)</Label>
            <Input id="especificacion" name="especificacion" defaultValue={route?.especificacion || ""} placeholder="Ej: Por Churuca" />
        </div>
         <div className="space-y-2">
            <Label>Categoría</Label>
            <Select name="category" defaultValue={route?.category || "grecia"} required>
                <SelectTrigger><SelectValue placeholder="Selecciona una categoría"/></SelectTrigger>
                <SelectContent>
                    <SelectItem value="grecia">Grecia</SelectItem>
                    <SelectItem value="sarchi">Sarchí</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="duracionMin">Duración (min)</Label>
            <Input id="duracionMin" name="duracionMin" type="number" defaultValue={route?.duracionMin ?? 0} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tarifaCRC">Tarifa (₡)</Label>
            <Input id="tarifaCRC" name="tarifaCRC" type="number" defaultValue={route?.tarifaCRC ?? 0} required />
          </div>
        </div>
        <div className="space-y-2">
            <Label htmlFor="image">Imagen (Opcional)</Label>
            <Input id="image" type="file" onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)} />
            {route?.imageUrl && <a href={route.imageUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline">Ver imagen actual</a>}
        </div>

        <DialogFooter>
          <DialogClose asChild><Button type="button" variant="secondary">Cancelar</Button></DialogClose>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Guardando...' : 'Guardar'}</Button>
        </DialogFooter>
      </form>
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

  const handleDelete = async (id: string, imagePath?: string) => {
    try {
        await dataService.deleteRoute(id);
        if (imagePath) {
            await storageService.deleteFile(imagePath);
        }
        toast({ title: "Ruta eliminada", description: "La ruta se ha eliminado correctamente." });
        onDataChange();
    } catch (error: any) {
        toast({ variant: "destructive", title: "Error", description: error.message || "No se pudo eliminar la ruta." });
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
              <TableHead className="text-right w-[140px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {routes.map((route) => (
              <TableRow key={route.id}>
                <TableCell className="font-medium">{route.nombre} {route.especificacion && <span className="text-xs text-muted-foreground">({route.especificacion})</span>}</TableCell>                
                <TableCell className="capitalize">{route.category}</TableCell>
                <TableCell>{route.duracionMin} min</TableCell>
                <TableCell>₡{route.tarifaCRC}</TableCell>
                <TableCell>
                  <div className="flex justify-end items-center">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(route)}><Edit className="h-4 w-4" /></Button>
                    <a href={`/mapa?route=${route.id}`} target="_blank" rel="noopener noreferrer">
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
                          <AlertDialogAction onClick={() => handleDelete(route.id, route.imagePath)} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
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
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
          if (!open) {
              setSelectedRoute(null);
          }
          setIsDialogOpen(open);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedRoute?.id ? 'Editar Ruta' : 'Nueva Ruta'}</DialogTitle>
            <DialogDescription>
                Completa los detalles de la ruta. Haz clic en guardar cuando termines.
            </DialogDescription>
          </DialogHeader>
          <RouteForm route={selectedRoute} onSave={onDataChange} onOpenChange={setIsDialogOpen} />
        </DialogContent>
      </Dialog>
    </Card>
  );
}
