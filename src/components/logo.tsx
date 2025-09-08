
import { cn } from "@/lib/utils";
import { Clapperboard, FileText } from "lucide-react";

type LogoProps = {
  className?: string;
  iconOnly?: boolean;
};

export function Logo({ className, iconOnly = false }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2 font-bold text-2xl tracking-wide", className)}>
      <div className="relative">
        <Clapperboard className="h-7 w-7 text-primary" />
        <FileText className="h-4 w-4 text-primary absolute -bottom-1 -right-1 bg-background" />
      </div>
      {!iconOnly && <h1 className="tracking-tighter">CinemaScope</h1>}
    </div>
  );
}
