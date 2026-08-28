import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AlertOctagon, BadgeCheck, FileSearch, Gauge, LogOut, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { StatCard } from "@/components/StatCard";
import { EmptyState } from "@/components/EmptyState";
import { LoadingScanner } from "@/components/LoadingScanner";
import { ScamReportTable, type ScamReportRow } from "@/components/ScamReportTable";
import { Button } from "@/components/ui/button";
import { SCAM_CATEGORIES } from "@/utils/riskScorer";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — FraudShield AI" },
      { name: "description", content: "Review, filter and triage submitted scam reports." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [riskFilter, setRiskFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const { data, isLoading, error } = useQuery({
    queryKey: ["scam_reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scam_reports")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ScamReportRow[];
    },
  });

  const reports = data ?? [];
  const filtered = reports.filter(
    (r) =>
      (riskFilter === "all" || r.risk_level === riskFilter) &&
      (categoryFilter === "all" || r.scam_category === categoryFilter),
  );

  async function handleStatusChange(id: string, status: string) {
    const { error } = await supabase.from("scam_reports").update({ status }).eq("id", id);
    if (error) {
      toast.error("Could not update the report status.");
      return;
    }
    toast.success(`Marked as ${status}.`);
    queryClient.invalidateQueries({ queryKey: ["scam_reports"] });
  }

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  }

  const count = (level: string) => reports.filter((r) => r.risk_level === level).length;
  const verified = reports.filter((r) => r.status === "Verified Scam").length;

  return (
    <Layout title="Admin Dashboard" subtitle="Triage community scam reports">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {reports.length} report{reports.length === 1 ? "" : "s"} in the database
        </p>
        <Button variant="outline" onClick={handleSignOut}>
          <LogOut />
          Sign out
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total Reports" value={reports.length} icon={FileSearch} />
        <StatCard label="High Risk" value={count("High Risk")} tone="danger" icon={AlertOctagon} />
        <StatCard
          label="Medium Risk"
          value={count("Medium Risk")}
          tone="warning"
          icon={ShieldAlert}
        />
        <StatCard label="Low Risk" value={count("Low Risk")} tone="safe" icon={Gauge} />
        <StatCard label="Verified Scams" value={verified} icon={BadgeCheck} />
      </div>

      <div className="mt-6 panel flex flex-wrap items-end gap-4 p-5">
        <div className="min-w-[180px] flex-1 space-y-1.5">
          <label
            htmlFor="risk-filter"
            className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground"
          >
            Filter by risk level
          </label>
          <select
            id="risk-filter"
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="h-10 w-full rounded-xl border border-input bg-secondary px-3 text-sm outline-none focus:border-primary"
          >
            <option value="all">All risk levels</option>
            <option value="High Risk">High Risk</option>
            <option value="Medium Risk">Medium Risk</option>
            <option value="Low Risk">Low Risk</option>
          </select>
        </div>
        <div className="min-w-[180px] flex-1 space-y-1.5">
          <label
            htmlFor="cat-filter"
            className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground"
          >
            Filter by category
          </label>
          <select
            id="cat-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 w-full rounded-xl border border-input bg-secondary px-3 text-sm outline-none focus:border-primary"
          >
            <option value="all">All categories</option>
            {SCAM_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6">
        {isLoading && <LoadingScanner label="Loading scam reports…" />}
        {error && (
          <EmptyState
            title="You do not have admin access"
            description="This account is signed in but has no admin role, so scam reports stay hidden."
            icon={ShieldAlert}
          />
        )}
        {!isLoading && !error && filtered.length === 0 && (
          <EmptyState
            title="No reports match these filters"
            description="Try clearing the risk or category filter."
          />
        )}
        {!isLoading && !error && filtered.length > 0 && (
          <ScamReportTable reports={filtered} onStatusChange={handleStatusChange} />
        )}
      </div>
    </Layout>
  );
}
