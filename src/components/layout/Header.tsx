
"use client";

import * as React from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

const navLinks = [
  { href: "/alertas", label: "Alertas" },
  { href: "/historia", label: "Historia" },
  { href: "/contacto", label: "Contacto" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  const NavLinks = ({ isMobile = false }: { isMobile?: boolean }) => (
    <>
      {navLinks.map(({ href, label }) => {
        const LinkComponent = isMobile ? SheetClose : Link;
        return (
          <Button key={href} variant="ghost" asChild>
            <LinkComponent href={href}>
              {label}
            </LinkComponent>
          </Button>
        );
      })}
    </>
  );

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled ? "bg-background/80 shadow-md backdrop-blur-sm" : "bg-transparent"
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        {/* Mobile Nav */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <nav className="mt-8 flex flex-col gap-4">
                <NavLinks isMobile />
              </nav>
            </SheetContent>
          </Sheet>
        </div>
        
        {/* Desktop Nav */}
        <nav className="hidden items-center gap-2 md:flex">
          <NavLinks />
        </nav>

        <Link href="/" aria-label="Ir a la página de inicio">
          <Logo />
        </Link>
      </div>
    </header>
  );
}
