import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  tone?: "default" | "danger" | "warning" | "safe";
}) {
  const toneClass = {
    default: "text-neon",
    danger: "text-destructive",
    warning: "text-warning",
    safe: "text-safe",
  }[tone];

  return (
    <div className="panel p-5 transition-transform duration-200 hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
        {Icon && (
          <span
            className={cn(
              "grid size-9 place-items-center rounded-xl border border-border bg-secondary",
              toneClass,
            )}
          >
            <Icon className="size-4" />
          </span>
        )}
      </div>
      <p className={cn("mt-4 font-mono text-3xl font-semibold", toneClass)}>{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
