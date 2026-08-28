import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Flag, Loader2, Link2, ShieldAlert } from "lucide-react";
import { Layout } from "@/components/Layout";
import { AnalyzerCard } from "@/components/AnalyzerCard";
import { RiskScoreCard } from "@/components/RiskScoreCard";
import { ReasonsList } from "@/components/ReasonsList";
import { SafetyTips } from "@/components/SafetyTips";
import { LoadingScanner } from "@/components/LoadingScanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PREFILL_KEY } from "@/components/ReportForm";
import { analyzeUrl } from "@/utils/urlDetector";
import type { AnalysisResult } from "@/utils/riskScorer";
import type { UrlBreakdown } from "@/utils/urlDetector";

export const Route = createFileRoute("/analyze-url")({
  head: () => ({
    meta: [
      { title: "Phishing URL Analyzer — FraudShield AI" },
      {
        name: "description",
        content:
          "Paste a suspicious link and FraudShield AI checks HTTPS, shorteners, lookalike domains and scam keywords.",
      },
      { property: "og:title", content: "Phishing URL Analyzer — FraudShield AI" },
      { property: "og:description", content: "Instant phishing risk scoring for any link." },
    ],
  }),
  component: AnalyzeUrlPage,
});

const SAMPLE = "http://sbi-kyc-verify.xyz/login/update?claim=reward";

function Breakdown({ breakdown }: { breakdown: UrlBreakdown }) {
  const rows = [
    { label: "Protocol", value: breakdown.protocol },
    { label: "Domain", value: breakdown.host || "—" },
    { label: "Path", value: breakdown.path },
    { label: "Length", value: `${breakdown.length} characters` },
  ];
  return (
    <div className="panel p-6">
      <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        URL breakdown
      </h3>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        {rows.map((r) => (
          <div key={r.label} className="rounded-xl border border-border bg-secondary/50 p-3">
            <dt className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              {r.label}
            </dt>
            <dd className="mt-1 truncate font-mono text-sm text-foreground">{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function AnalyzeUrlPage() {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<(AnalysisResult & { breakdown: UrlBreakdown }) | null>(null);

  function handleAnalyze() {
    if (url.trim().length < 4) return;
    setLoading(true);
    setResult(null);
    window.setTimeout(() => {
      setResult(analyzeUrl(url));
      setLoading(false);
    }, 700);
  }

  function handleReport() {
    if (!result) return;
    sessionStorage.setItem(
      PREFILL_KEY,
      JSON.stringify({
        content: url,
        category: result.category === "Safe" ? "Other" : result.category,
        riskLevel: result.riskLevel,
        riskScore: result.riskScore,
        reasons: result.reasons,
        isUrl: true,
      }),
    );
    navigate({ to: "/report-scam" });
  }

  return (
    <Layout title="Phishing URL Analyzer" subtitle="Inspect a link before you open it">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <AnalyzerCard
          title="Paste the suspicious URL"
          description="We never open the link — only its structure is inspected."
        >
          <div className="flex items-start gap-3 rounded-xl border border-warning/40 bg-warning/10 p-3 text-xs text-warning">
            <ShieldAlert className="mt-0.5 size-4 shrink-0" />
            <p>Do not log in or enter card details on links you were sent unexpectedly.</p>
          </div>

          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/login"
            className="h-11 bg-secondary font-mono text-sm"
          />
          <button
            type="button"
            onClick={() => setUrl(SAMPLE)}
            className="text-xs text-muted-foreground underline underline-offset-4"
          >
            Use a sample phishing URL
          </button>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="neon"
              size="lg"
              onClick={handleAnalyze}
              disabled={loading || url.trim().length < 4}
            >
              {loading ? <Loader2 className="animate-spin" /> : <Link2 />}
              Analyze URL
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                setUrl("");
                setResult(null);
              }}
            >
              Clear
            </Button>
          </div>
        </AnalyzerCard>

        <div className="space-y-6">
          {loading && <LoadingScanner label="Inspecting domain, protocol and keywords…" />}
          {!loading && !result && (
            <div className="panel p-10 text-center text-sm text-muted-foreground">
              Your URL risk report will appear here.
            </div>
          )}
          {result && !loading && (
            <>
              <RiskScoreCard result={result} />
              <Breakdown breakdown={result.breakdown} />
              <ReasonsList reasons={result.reasons} />
              <SafetyTips tips={result.safetyTips} />
              <Button variant="destructive" size="lg" className="w-full" onClick={handleReport}>
                <Flag />
                Report this URL
              </Button>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
