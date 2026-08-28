import { RiskBadge } from "./RiskBadge";
import { REPORT_STATUSES } from "@/utils/riskScorer";

export interface ScamReportRow {
  id: string;
  input_text: string | null;
  input_url: string | null;
  scam_category: string;
  risk_score: number;
  risk_level: string;
  reasons: string[];
  user_remark: string | null;
  status: string;
  created_at: string;
}

export function ScamReportTable({
  reports,
  onStatusChange,
}: {
  reports: ScamReportRow[];
  onStatusChange: (id: string, status: string) => void;
}) {
  return (
    <div className="panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Message / URL</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Score</th>
              <th className="px-4 py-3 font-medium">Risk</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr
                key={r.id}
                className="border-b border-border/60 transition-colors last:border-0 hover:bg-secondary/60"
              >
                <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString(undefined, {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="max-w-[320px] px-4 py-3">
                  <p className="truncate text-foreground">{r.input_text || r.input_url}</p>
                  {r.user_remark && (
                    <p className="truncate text-xs text-muted-foreground">“{r.user_remark}”</p>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{r.scam_category}</td>
                <td className="px-4 py-3 font-mono text-foreground">{r.risk_score}</td>
                <td className="px-4 py-3">
                  <RiskBadge level={r.risk_level} />
                </td>
                <td className="px-4 py-3">
                  <select
                    value={r.status}
                    onChange={(e) => onStatusChange(r.id, e.target.value)}
                    className="h-9 rounded-lg border border-input bg-secondary px-2 text-xs text-foreground outline-none focus:border-primary"
                  >
                    {REPORT_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
