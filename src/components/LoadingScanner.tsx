import { ScanLine } from "lucide-react";

export function LoadingScanner({ label = "Analyzing for fraud signals…" }: { label?: string }) {
  return (
    <div className="panel relative overflow-hidden p-10 text-center">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/25 to-transparent animate-scanline" />
      <ScanLine className="mx-auto size-8 text-neon animate-pulse-glow" />
      <p className="mt-4 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
