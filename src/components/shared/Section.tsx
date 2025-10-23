import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type SectionProps = {
  id: string;
  className?: string;
  children: ReactNode;
};

export const Section = ({ id, className, children }: SectionProps) => {
  return (
    <section id={id} className={cn("py-16 md:py-24", className)}>
      <div className="container">{children}</div>
    </section>
  );
};

type SectionHeaderProps = {
  title: string;
  description?: string;
  className?: string;
};

export const SectionHeader = ({ title, description, className }: SectionHeaderProps) => {
  return (
    <div className={cn("mb-12 text-center", className)}>
      <h2 className="font-headline text-3xl font-bold tracking-tight md:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
};
