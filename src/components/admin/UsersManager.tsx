"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getUsers, createUser, deleteUser } from "@/lib/actions";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Trash2, Users } from "lucide-react";
import type { User } from "@/lib/definitions";
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
import { Skeleton } from "../ui/skeleton";

const userSchema = z.object({
  email: z.string().email({ message: "Email inválido." }),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
});

type UserFormValues = z.infer<typeof userSchema>;

const UserForm = ({ onOpenChange }: { onOpenChange: (open: boolean) => void }) => {
  const { toast } = useToast();
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: { email: "", password: "" },
  });

  const { formState, setError } = form;

  async function onSubmit(data: UserFormValues) {
    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('password', data.password);

    const result = await createUser(formData);
    if (result.success) {
      toast({ title: "Usuario creado", description: "El nuevo usuario ha sido creado." });
      onOpenChange(false); // This will also trigger a refresh in the parent
      form.reset();
    } else {
        const errorMessage = result.error?._errors?.[0] || "No se pudo crear el usuario.";
        toast({ variant: "destructive", title: "Error", description: errorMessage });
        if (result.error?.email) {
            setError('email', { type: 'manual', message: result.error.email[0]});
        }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl><Input type="email" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="password" render={({ field }) => (
          <FormItem>
            <FormLabel>Contraseña</FormLabel>
            <FormControl><Input type="password" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <DialogFooter>
          <DialogClose asChild><Button type="button" variant="secondary">Cancelar</Button></DialogClose>
          <Button type="submit" disabled={formState.isSubmitting}>
            {formState.isSubmitting ? 'Creando...' : 'Crear Usuario'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default function UsersManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    const { users, error } = await getUsers();
    if (users) {
      setUsers(users);
    }
    if (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar los usuarios." });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (uid: string) => {
    const result = await deleteUser(uid);
    if (result.success) {
      toast({ title: "Usuario eliminado", description: "El usuario ha sido eliminado." });
      fetchUsers(); // Refresh list
    } else {
      toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar el usuario." });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Usuarios</CardTitle>
          <CardDescription>Añade o elimina usuarios administradores.</CardDescription>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}><PlusCircle className="mr-2 h-4 w-4" /> Nuevo Usuario</Button>
      </CardHeader>
      <CardContent>
        {loading ? (
            <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        ) : users.length > 0 ? (
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right w-[100px]">Acciones</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.map((user) => (
                <TableRow key={user.uid}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>{user.displayName}</TableCell>
                    <TableCell>{user.disabled ? 'Deshabilitado' : 'Activo'}</TableCell>
                    <TableCell>
                    <div className="flex justify-end items-center">
                        <AlertDialog>
                        <AlertDialogTrigger asChild>
                            {/* Prevent deleting the main admin user as a safeguard */}
                            <Button variant="ghost" size="icon" disabled={user.email === 'admin@asg.cr'}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>¿Estás seguro?</AlertDialogTitle><AlertDialogDescription>Esta acción es permanente y eliminará al usuario.</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(user.uid)} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                        </AlertDialog>
                    </div>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        ) : (
            <div className="text-center py-12 text-muted-foreground">
                <Users className="mx-auto h-12 w-12" />
                <p className="mt-4">No se encontraron usuarios.</p>
            </div>
        )}
      </CardContent>
      <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
          setIsDialogOpen(isOpen);
          if (!isOpen) {
            fetchUsers(); // Refresh on close
          }
      }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nuevo Usuario</DialogTitle></DialogHeader>
          <UserForm onOpenChange={setIsDialogOpen} />
        </DialogContent>
      </Dialog>
    </Card>
  );
}
