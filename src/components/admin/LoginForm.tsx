"use client";

import { useFormState, useFormStatus } from 'react-dom';
import { authenticate } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from 'lucide-react';

function LoginButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Iniciando sesión...' : 'Iniciar Sesión'}
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useFormState(authenticate, undefined);

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="username">Usuario</Label>
        <Input
          id="username"
          name="username"
          type="text"
          placeholder="admin"
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input id="password" name="password" type="password" required />
      </div>
      
      {state?.error && (
         <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {state.error}
          </AlertDescription>
        </Alert>
      )}

      <LoginButton />
    </form>
  );
}
