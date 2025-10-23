import { LoginForm } from "@/components/admin/LoginForm";
import { Logo } from "@/components/shared/Logo";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
            <div className="mx-auto">
                <Logo />
            </div>
          <h1 className="text-2xl font-semibold tracking-tight font-headline">
            Acceso de Administrador
          </h1>
          <p className="text-sm text-muted-foreground">
            Introduce tus credenciales para acceder al panel
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
