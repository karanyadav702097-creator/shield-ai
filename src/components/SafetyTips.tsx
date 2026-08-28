import { ShieldCheck } from "lucide-react";

export function SafetyTips({ tips, title = "Safety tips" }: { tips: string[]; title?: string }) {
  return (
    <div className="panel p-6">
      <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {title}
      </h3>
      <ul className="mt-4 space-y-3">
        {tips.map((tip) => (
          <li key={tip} className="flex gap-3 text-sm text-foreground">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-neon" />
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
