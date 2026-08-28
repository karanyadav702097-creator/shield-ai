import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eraser, Flag, Loader2, ScanSearch, ShieldAlert } from "lucide-react";
import { Layout } from "@/components/Layout";
import { AnalyzerCard } from "@/components/AnalyzerCard";
import { RiskScoreCard } from "@/components/RiskScoreCard";
import { ReasonsList } from "@/components/ReasonsList";
import { SafetyTips } from "@/components/SafetyTips";
import { LoadingScanner } from "@/components/LoadingScanner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PREFILL_KEY } from "@/components/ReportForm";
import { analyzeMessageWithAI } from "@/utils/aiFraudDetector";
import type { AIAnalysisResult } from "@/utils/aiFraudDetector";

export const Route = createFileRoute("/analyze-message")({
  head: () => ({
    meta: [
      { title: "Scam Message Analyzer — FraudShield AI" },
      {
        name: "description",
        content:
          "Paste a suspicious SMS, WhatsApp message or email and get an instant fraud risk score with reasons.",
      },
      { property: "og:title", content: "Scam Message Analyzer — FraudShield AI" },
      { property: "og:description", content: "Instant scam scoring for suspicious messages." },
    ],
  }),
  component: AnalyzeMessagePage,
});

const SAMPLE =
  "Your bank account will be blocked today. Click this link immediately to update KYC. http://sbi-kyc-verify.xyz/update";

function AnalyzeMessagePage() {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState("Analyzing for fraud signals…");
  const [result, setResult] = useState<AIAnalysisResult | null>(null);

  async function handleAnalyze() {
    if (text.trim().length < 5) return;
    setLoading(true);
    setResult(null);
    setLoadingLabel("Loading AI model — first run only, cached after this…");
    // Give the loading state a moment to paint before the (potentially heavy,
    // first-time) model download/inference starts.
    await new Promise((r) => window.setTimeout(r, 150));
    setLoadingLabel("Running AI + keyword analysis…");
    const analysis = await analyzeMessageWithAI(text);
    setResult(analysis);
    setLoading(false);
  }

  function handleReport() {
    if (!result) return;
    sessionStorage.setItem(
      PREFILL_KEY,
      JSON.stringify({
        content: text,
        category: result.category,
        riskLevel: result.riskLevel,
        riskScore: result.riskScore,
        reasons: result.reasons,
        isUrl: false,
      }),
    );
    navigate({ to: "/report-scam" });
  }

  return (
    <Layout
      title="Scam Message Analyzer"
      subtitle="Check SMS, WhatsApp, email or payment request text"
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <AnalyzerCard
          title="Paste the suspicious message"
          description="Analysis runs in your browser — nothing is stored unless you report it."
        >
          <div className="flex items-start gap-3 rounded-xl border border-warning/40 bg-warning/10 p-3 text-xs text-warning">
            <ShieldAlert className="mt-0.5 size-4 shrink-0" />
            <p>Never enter your real OTP, PIN, password, CVV, or full card number.</p>
          </div>

          <Textarea
            rows={9}
            value={text}
            maxLength={2000}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste the message text here…"
            className="resize-y bg-secondary font-mono text-sm"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <button
              type="button"
              onClick={() => setText(SAMPLE)}
              className="underline underline-offset-4"
            >
              Use a sample scam message
            </button>
            <span className="font-mono">{text.length}/2000</span>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="neon"
              size="lg"
              onClick={handleAnalyze}
              disabled={loading || text.trim().length < 5}
            >
              {loading ? <Loader2 className="animate-spin" /> : <ScanSearch />}
              Analyze Message
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                setText("");
                setResult(null);
              }}
            >
              <Eraser />
              Clear
            </Button>
          </div>
        </AnalyzerCard>

        <div className="space-y-6">
          {loading && <LoadingScanner label={loadingLabel} />}
          {!loading && !result && (
            <div className="panel p-10 text-center text-sm text-muted-foreground">
              Your analysis result will appear here.
            </div>
          )}
          {result && !loading && (
            <>
              <RiskScoreCard result={result} />
              {result.usedAI && (
                <div className="flex items-center gap-2 rounded-xl border border-neon/30 bg-neon/5 px-3 py-2 text-xs text-neon">
                  <span className="size-1.5 rounded-full bg-neon animate-pulse-glow" />
                  Scored using an on-device AI model ({result.aiConfidence}% confidence) — runs
                  free, fully in your browser
                </div>
              )}
              <ReasonsList reasons={result.reasons} />
              <SafetyTips tips={result.safetyTips} />
              <Button variant="destructive" size="lg" className="w-full" onClick={handleReport}>
                <Flag />
                Report this scam
              </Button>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
