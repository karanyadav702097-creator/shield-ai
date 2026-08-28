import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { ReportForm } from "@/components/ReportForm";
import { SafetyTips } from "@/components/SafetyTips";
import { GENERAL_SAFETY_TIPS } from "@/utils/riskScorer";

export const Route = createFileRoute("/report-scam")({
  head: () => ({
    meta: [
      { title: "Report a Scam — FraudShield AI" },
      {
        name: "description",
        content:
          "Report phishing links, fake KYC messages, OTP fraud and payment scams. Sensitive data is masked automatically.",
      },
      { property: "og:title", content: "Report a Scam — FraudShield AI" },
      { property: "og:description", content: "Help protect others by reporting online fraud." },
    ],
  }),
  component: ReportScamPage,
});

function ReportScamPage() {
  return (
    <Layout title="Report Scam" subtitle="Submitted reports help the community stay safe">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <ReportForm />
        <div className="space-y-6">
          <div className="panel p-6">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              What happens next
            </h3>
            <ol className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>1. Your report is masked and stored securely.</li>
              <li>2. A reviewer marks it as Verified Scam, False Report or Under Review.</li>
              <li>3. Verified patterns strengthen future detections.</li>
            </ol>
          </div>
          <SafetyTips tips={GENERAL_SAFETY_TIPS} title="Before you report" />
        </div>
      </div>
    </Layout>
  );
}
