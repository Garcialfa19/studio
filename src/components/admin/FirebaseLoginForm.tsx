'use client';
import { useState } from 'react';
import { useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';

export function FirebaseLoginForm() {
  const { auth } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = async () => {
    if (!auth) return;
    setIsSigningIn(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/admin/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error de autenticación',
        description: 'Usuario o contraseña incorrectos.',
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/admin/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error con Google',
        description: error.message,
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
       <Button variant="outline" onClick={handleGoogleSignIn}>
        Continuar con Google
      </Button>

      <div className="relative">
        <Separator />
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center bg-muted px-2">
            <span className="text-xs uppercase text-muted-foreground">O</span>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="m@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isSigningIn}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isSigningIn}
        />
      </div>
      <div className="flex gap-2">
        <Button onClick={handleSignIn} disabled={isSigningIn} className="w-full">
          {isSigningIn ? 'Iniciando...' : 'Iniciar Sesión'}
        </Button>
      </div>
    </div>
  );
}
