import { AlertTriangle } from "lucide-react";

export function ReasonsList({ reasons }: { reasons: string[] }) {
  return (
    <div className="panel p-6">
      <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Why this was flagged
      </h3>
      <ul className="mt-4 space-y-3">
        {reasons.map((reason) => (
          <li
            key={reason}
            className="flex gap-3 rounded-xl border border-border bg-secondary/50 p-3 text-sm"
          >
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
            <span className="text-foreground">{reason}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
