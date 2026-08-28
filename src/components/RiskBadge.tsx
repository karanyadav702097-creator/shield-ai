import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/utils/riskScorer";

export function riskTone(level: string) {
  if (level === "High Risk") return "danger" as const;
  if (level === "Medium Risk") return "warning" as const;
  return "safe" as const;
}

export function RiskBadge({ level, className }: { level: RiskLevel | string; className?: string }) {
  const tone = riskTone(level);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
        tone === "danger" && "border-destructive/40 bg-destructive/10 text-destructive",
        tone === "warning" && "border-warning/40 bg-warning/10 text-warning",
        tone === "safe" && "border-safe/40 bg-safe/10 text-safe",
        className,
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          tone === "danger" && "bg-destructive",
          tone === "warning" && "bg-warning",
          tone === "safe" && "bg-safe",
        )}
      />
      {level}
    </span>
  );
}
