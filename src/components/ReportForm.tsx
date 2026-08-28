import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Send, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SCAM_CATEGORIES } from "@/utils/riskScorer";
import { maskSensitiveData, maskUrl } from "@/utils/maskSensitiveData";
import { LOOKUP_TYPES, normalizeLookupValue, type LookupType } from "@/utils/normalizeLookup";

export const PREFILL_KEY = "fraudshield:prefill";

export interface ReportPrefill {
  content?: string;
  category?: string;
  riskLevel?: string;
  riskScore?: number;
  reasons?: string[];
  isUrl?: boolean;
}

const RISK_LEVELS = ["Low Risk", "Medium Risk", "High Risk"];

export function ReportForm() {
  const [category, setCategory] = useState<string>("Phishing Link");
  const [content, setContent] = useState("");
  const [remark, setRemark] = useState("");
  const [riskLevel, setRiskLevel] = useState("");
  const [prefill, setPrefill] = useState<ReportPrefill | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [lookupType, setLookupType] = useState<LookupType | "">("");
  const [lookupValue, setLookupValue] = useState("");

  useEffect(() => {
    const raw = sessionStorage.getItem(PREFILL_KEY);
    if (!raw) return;
    try {
      const data = JSON.parse(raw) as ReportPrefill;
      setPrefill(data);
      if (data.content) setContent(data.content);
      if (data.category && SCAM_CATEGORIES.includes(data.category as never))
        setCategory(data.category);
      if (data.riskLevel) setRiskLevel(data.riskLevel);
    } catch {
      /* ignore malformed prefill */
    }
    sessionStorage.removeItem(PREFILL_KEY);
  }, []);

  const isUrl = prefill?.isUrl ?? /^https?:\/\//i.test(content.trim());

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (content.trim().length < 5) {
      toast.error("Please paste the suspicious message or URL.");
      return;
    }
    setSubmitting(true);
    const safeContent = isUrl ? maskUrl(content.trim()) : maskSensitiveData(content.trim());

    const { error } = await supabase.from("scam_reports").insert({
      input_text: isUrl ? null : safeContent,
      input_url: isUrl ? safeContent : null,
      scam_category: category,
      risk_score: prefill?.riskScore ?? 0,
      risk_level: riskLevel || prefill?.riskLevel || "Medium Risk",
      reasons: prefill?.reasons ?? [],
      user_remark: maskSensitiveData(remark.trim()) || null,
      lookup_type: lookupType || null,
      lookup_value:
        lookupType && lookupValue.trim()
          ? normalizeLookupValue(lookupValue.trim(), lookupType)
          : null,
    });
    setSubmitting(false);

    if (error) {
      toast.error("Could not submit the report. Please try again.");
      return;
    }
    toast.success("Report submitted. Thank you for helping protect others.");
    setContent("");
    setRemark("");
    setRiskLevel("");
    setPrefill(null);
    setLookupType("");
    setLookupValue("");
  }

  return (
    <form onSubmit={handleSubmit} className="panel space-y-5 p-6">
      <div className="flex items-start gap-3 rounded-xl border border-warning/40 bg-warning/10 p-3 text-xs text-warning">
        <ShieldAlert className="mt-0.5 size-4 shrink-0" />
        <p>
          Never enter your real OTP, PIN, password, CVV, or full card number. Any sensitive values
          are automatically masked before the report is stored.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Scam type</Label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-10 w-full rounded-xl border border-input bg-secondary px-3 text-sm text-foreground outline-none focus:border-primary"
        >
          {SCAM_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Message or URL</Label>
        <Textarea
          id="content"
          rows={5}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste the suspicious message or link here…"
          className="resize-y bg-secondary"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="lookup-type">
          Linked phone / UPI ID / domain (optional — makes this searchable in Reputation Lookup)
        </Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            id="lookup-type"
            value={lookupType}
            onChange={(e) => setLookupType(e.target.value as LookupType | "")}
            className="h-10 rounded-xl border border-input bg-secondary px-3 text-sm text-foreground outline-none focus:border-primary sm:w-48"
          >
            <option value="">Not linked</option>
            {LOOKUP_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <input
            id="lookup-value"
            value={lookupValue}
            onChange={(e) => setLookupValue(e.target.value)}
            disabled={!lookupType}
            placeholder={
              lookupType
                ? LOOKUP_TYPES.find((t) => t.value === lookupType)?.placeholder
                : "Choose a type first"
            }
            className="h-10 w-full rounded-xl border border-input bg-secondary px-3 text-sm text-foreground outline-none focus:border-primary disabled:opacity-50"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="remark">Your remark (optional)</Label>
        <Textarea
          id="remark"
          rows={3}
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          placeholder="How did you receive it? What happened?"
          className="resize-y bg-secondary"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="risk">Risk level (optional)</Label>
        <select
          id="risk"
          value={riskLevel}
          onChange={(e) => setRiskLevel(e.target.value)}
          className="h-10 w-full rounded-xl border border-input bg-secondary px-3 text-sm text-foreground outline-none focus:border-primary"
        >
          <option value="">Let FraudShield decide</option>
          {RISK_LEVELS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <Button
        type="submit"
        variant="neon"
        size="lg"
        disabled={submitting}
        className="w-full sm:w-auto"
      >
        {submitting ? <Loader2 className="animate-spin" /> : <Send />}
        {submitting ? "Submitting…" : "Report Scam"}
      </Button>
    </form>
  );
}
