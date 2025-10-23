export function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-muted py-8">
      <div className="container text-center text-sm text-muted-foreground">
        <p>&copy; {currentYear} Autotransportes Santa Gertrudis. Todos los derechos reservados.</p>
        <p className="mt-2">Diseñado y desarrollado con ♥</p>
      </div>
    </footer>
  );
}
