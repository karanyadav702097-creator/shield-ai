import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Loader2, ShieldCheck, ShieldAlert, ShieldQuestion } from "lucide-react";
import { Layout } from "@/components/Layout";
import { AnalyzerCard } from "@/components/AnalyzerCard";
import { StatCard } from "@/components/StatCard";
import { EmptyState } from "@/components/EmptyState";
import { LoadingScanner } from "@/components/LoadingScanner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { LOOKUP_TYPES, normalizeLookupValue, type LookupType } from "@/utils/normalizeLookup";

export const Route = createFileRoute("/lookup")({
  head: () => ({
    meta: [
      { title: "Reputation Lookup — FraudShield AI" },
      {
        name: "description",
        content:
          "Search a phone number, UPI ID, or domain to see how many times the community has reported it as a scam.",
      },
      { property: "og:title", content: "Reputation Lookup — FraudShield AI" },
      {
        property: "og:description",
        content: "Check if a number, UPI ID or website has already been reported.",
      },
    ],
  }),
  component: LookupPage,
});

interface ReputationResult {
  total_reports: number;
  reports_last_30_days: number;
  verified_scam_count: number;
  top_category: string | null;
  most_recent_at: string | null;
}

function verdictFor(result: ReputationResult): {
  tone: "safe" | "warning" | "danger";
  label: string;
  icon: typeof ShieldCheck;
} {
  if (result.total_reports === 0) {
    return { tone: "safe", label: "No reports found", icon: ShieldCheck };
  }
  if (result.total_reports >= 5 || result.reports_last_30_days >= 3) {
    return { tone: "danger", label: "Reported frequently — high caution", icon: ShieldAlert };
  }
  return { tone: "warning", label: "Reported before — be cautious", icon: ShieldQuestion };
}

function LookupPage() {
  const [type, setType] = useState<LookupType>("phone");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReputationResult | null>(null);
  const [searchedFor, setSearchedFor] = useState<string>("");

  async function handleSearch() {
    const normalized = normalizeLookupValue(value, type);
    if (!normalized) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const { data, error: rpcError } = await supabase.rpc("search_reputation", {
      _lookup_value: normalized,
    });

    setLoading(false);

    if (rpcError) {
      setError("Could not complete the lookup right now. Please try again.");
      return;
    }

    const row = Array.isArray(data) ? data[0] : data;
    setResult(
      row ?? {
        total_reports: 0,
        reports_last_30_days: 0,
        verified_scam_count: 0,
        top_category: null,
        most_recent_at: null,
      },
    );
    setSearchedFor(normalized);
  }

  return (
    <Layout
      title="Reputation Lookup"
      subtitle="Search a phone number, UPI ID, or domain against community reports"
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <AnalyzerCard
          title="Search a phone number, UPI ID, or domain"
          description="We only ever show aggregated counts — never anyone's raw report text."
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value as LookupType);
                setResult(null);
              }}
              className="h-11 rounded-xl border border-input bg-secondary px-3 text-sm text-foreground outline-none focus:border-primary sm:w-48"
            >
              {LOOKUP_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder={LOOKUP_TYPES.find((t) => t.value === type)?.placeholder}
              className="h-11 w-full rounded-xl border border-input bg-secondary px-3 font-mono text-sm text-foreground outline-none focus:border-primary"
            />
          </div>

          <Button
            variant="neon"
            size="lg"
            onClick={handleSearch}
            disabled={loading || value.trim().length < 3}
          >
            {loading ? <Loader2 className="animate-spin" /> : <Search />}
            Search
          </Button>

          <p className="text-xs text-muted-foreground">
            Results are based only on values reporters explicitly linked to a report — not every
            report includes one, so a clean result does not guarantee safety.
          </p>
        </AnalyzerCard>

        <div className="space-y-6">
          {loading && <LoadingScanner label="Checking community reports…" />}

          {error && !loading && (
            <div className="panel p-6 text-sm text-destructive">{error}</div>
          )}

          {!loading && !error && !result && (
            <div className="panel p-10 text-center text-sm text-muted-foreground">
              Lookup results will appear here.
            </div>
          )}

          {result && !loading && (
            <>
              {result.total_reports === 0 ? (
                <EmptyState
                  icon={ShieldCheck}
                  title={`No reports found for "${searchedFor}"`}
                  description="This doesn't guarantee it's safe — nothing has just been reported yet through FraudShield."
                />
              ) : (
                (() => {
                  const verdict = verdictFor(result);
                  return (
                    <div className="panel p-6">
                      <div
                        className={
                          verdict.tone === "danger"
                            ? "flex items-center gap-2 text-destructive"
                            : verdict.tone === "warning"
                              ? "flex items-center gap-2 text-warning"
                              : "flex items-center gap-2 text-safe"
                        }
                      >
                        <verdict.icon className="size-5" />
                        <p className="text-sm font-semibold">{verdict.label}</p>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Results for <span className="font-mono">{searchedFor}</span>
                      </p>
                    </div>
                  );
                })()
              )}

              {result.total_reports > 0 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <StatCard label="Total Reports" value={result.total_reports} />
                  <StatCard
                    label="Last 30 Days"
                    value={result.reports_last_30_days}
                    tone={result.reports_last_30_days > 0 ? "warning" : "default"}
                  />
                  <StatCard
                    label="Verified Scams"
                    value={result.verified_scam_count}
                    tone={result.verified_scam_count > 0 ? "danger" : "default"}
                  />
                  <StatCard label="Most Common Type" value={result.top_category ?? "—"} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
