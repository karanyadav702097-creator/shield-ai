import { cn } from "@/lib/utils";
import { RiskBadge, riskTone } from "./RiskBadge";
import type { AnalysisResult } from "@/utils/riskScorer";

export function RiskScoreCard({ result }: { result: AnalysisResult }) {
  const tone = riskTone(result.riskLevel);
  const circumference = 2 * Math.PI * 52;
  const offset = circumference - (result.riskScore / 100) * circumference;

  const strokeClass =
    tone === "danger" ? "text-destructive" : tone === "warning" ? "text-warning" : "text-safe";

  return (
    <div className="panel flex flex-col items-center gap-6 p-6 sm:flex-row sm:items-center sm:gap-8">
      <div className="relative grid size-36 shrink-0 place-items-center">
        <svg viewBox="0 0 120 120" className="size-36 -rotate-90">
          <circle
            cx="60"
            cy="60"
            r="52"
            strokeWidth="10"
            className="stroke-secondary"
            fill="none"
          />
          <circle
            cx="60"
            cy="60"
            r="52"
            strokeWidth="10"
            strokeLinecap="round"
            fill="none"
            className={cn("transition-all duration-700", strokeClass)}
            stroke="currentColor"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute text-center">
          <p className={cn("font-mono text-3xl font-bold", strokeClass)}>{result.riskScore}</p>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Risk score
          </p>
        </div>
      </div>

      <div className="w-full space-y-3 text-center sm:text-left">
        <RiskBadge level={result.riskLevel} />
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Detected category
          </p>
          <p className="text-xl font-semibold text-foreground">{result.category}</p>
        </div>
        <p className="text-sm text-muted-foreground">
          {tone === "danger"
            ? "Strong scam indicators found. Do not respond, click, or pay."
            : tone === "warning"
              ? "Some suspicious indicators found. Verify before acting."
              : "No strong scam indicators found. Still stay cautious."}
        </p>
      </div>
    </div>
  );
}
