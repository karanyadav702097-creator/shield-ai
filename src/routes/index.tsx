import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Link2,
  MessageSquareWarning,
  Gauge,
  Flag,
  ShieldHalf,
  Activity,
  AlertOctagon,
  FileSearch,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FraudShield AI — Detect Online Scams Before They Harm You" },
      {
        name: "description",
        content:
          "FraudShield AI analyzes suspicious messages, phishing URLs and fake payment requests, and returns an instant fraud risk score.",
      },
      { property: "og:title", content: "FraudShield AI — Online Fraud Detection Assistant" },
      {
        property: "og:description",
        content: "Instant risk scoring for scam messages and phishing links.",
      },
    ],
  }),
  component: Index,
});

const FEATURES = [
  {
    icon: Link2,
    title: "Fake Link Detection",
    body: "Spots shorteners, lookalike domains, IP-based hosts and missing HTTPS.",
  },
  {
    icon: MessageSquareWarning,
    title: "Scam Message Analysis",
    body: "Flags urgency, blocking threats, OTP requests and reward bait.",
  },
  {
    icon: Gauge,
    title: "Risk Score System",
    body: "A transparent 0–100 score with the exact reasons behind it.",
  },
  {
    icon: Flag,
    title: "Report Scam",
    body: "Submit scams safely — sensitive values are masked before storage.",
  },
];

function Index() {
  const [stats, setStats] = useState<{
    totalReports: number | null;
    highRiskAlerts: number | null;
    threatsDetected: number | null;
  }>({ totalReports: null, highRiskAlerts: null, threatsDetected: null });

  useEffect(() => {
    let cancelled = false;
    supabase
      .rpc("homepage_stats")
      .then(({ data, error }) => {
        if (cancelled || error) return;
        const row = Array.isArray(data) ? data[0] : data;
        if (!row) return;
        setStats({
          totalReports: row.total_reports,
          highRiskAlerts: row.high_risk_alerts_30d,
          threatsDetected: row.threats_detected,
        });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const fmt = (n: number | null) => (n === null ? "—" : n.toLocaleString());

  return (
    <Layout title="Overview" subtitle="Real-time fraud detection console">
      <div className="grid-bg panel relative overflow-hidden p-8 sm:p-12">
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            <ShieldHalf className="size-3.5 text-neon" />
            AI-based online fraud detection assistant
          </span>
          <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Detect Online Scams <span className="text-neon">Before They Harm You</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            FraudShield AI analyzes suspicious messages, phishing URLs, and fake payment requests to
            protect you from online fraud.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild variant="neon" size="lg">
              <Link to="/analyze-message">Check Message</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/analyze-url">Check URL</Link>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <Link to="/report-scam">Report Scam</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="AI Scanner" value="Active" hint="Local detection engine" icon={Activity} />
        <StatCard
          label="Total Reports"
          value={fmt(stats.totalReports)}
          hint="Community submissions"
          icon={FileSearch}
        />
        <StatCard
          label="High Risk Alerts"
          value={fmt(stats.highRiskAlerts)}
          tone="danger"
          hint="Last 30 days"
          icon={AlertOctagon}
        />
        <StatCard
          label="Threats Detected"
          value={fmt(stats.threatsDetected)}
          tone="warning"
          hint="Signals matched"
          icon={Gauge}
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {FEATURES.map((f) => (
          <article
            key={f.title}
            className="panel p-6 transition-transform duration-200 hover:-translate-y-1"
          >
            <span className="grid size-10 place-items-center rounded-xl border border-border bg-secondary text-neon">
              <f.icon className="size-5" />
            </span>
            <h3 className="mt-4 text-base font-semibold text-foreground">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
          </article>
        ))}
      </div>

      <div className="mt-6 panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold">Not sure about a message you just received?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Paste it in — analysis happens instantly and nothing is stored unless you report it.
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="neon">
              <Link to="/analyze-message">Analyze Message</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/safety-tips">View Safety Tips</Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
