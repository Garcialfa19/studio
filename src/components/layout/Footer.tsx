import { Facebook } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-muted py-8">
      <div className="container text-center text-sm text-muted-foreground space-y-2">
        <p>Copyright © 2020 Autotransportes Santa Gertrudis.</p>
        <div className="flex justify-center items-center gap-2">
          <span>Síguenos en:</span>
          <a href="#" aria-label="Facebook" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
            <Facebook className="h-5 w-5" />
          </a>
        </div>
        <p>Contacto: info@asgcr.com | Tel: +506 2494-4231</p>
      </div>
    </footer>
  );
}
