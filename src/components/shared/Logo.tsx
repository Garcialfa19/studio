import { cn } from "@/lib/utils";

export const Logo = ({ className }: { className?: string }) => (
  <div className={cn("flex items-center justify-center font-headline font-bold text-primary bg-primary-foreground/50 rounded-md p-2 shadow-inner", className)}>
    <span className="text-xl tracking-wider">ASG</span>
  </div>
);
