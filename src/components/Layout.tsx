import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  MessageSquareWarning,
  Link2,
  Flag,
  ShieldCheck,
  LogIn,
  Menu,
  ShieldHalf,
  X,
  Search,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/analyze-message", label: "Message Analyzer", icon: MessageSquareWarning },
  { to: "/analyze-url", label: "URL Analyzer", icon: Link2 },
  { to: "/lookup", label: "Reputation Lookup", icon: Search },
  { to: "/report-scam", label: "Report Scam", icon: Flag },
  { to: "/safety-tips", label: "Safety Tips", icon: ShieldCheck },
  { to: "/admin", label: "Admin Dashboard", icon: LogIn },
] as const;

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-3">
      <span className="grid size-9 place-items-center rounded-xl border border-border bg-card text-neon glow">
        <ShieldHalf className="size-5" />
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-semibold tracking-wide text-foreground">
          FraudShield AI
        </span>
        <span className="block text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Threat console
        </span>
      </span>
    </Link>
  );
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all",
              active
                ? "border border-border bg-accent text-accent-foreground glow"
                : "border border-transparent text-muted-foreground hover:border-border hover:bg-secondary hover:text-foreground",
            )}
          >
            <item.icon className={cn("size-4 transition-colors", active && "text-neon")} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Layout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar px-4 py-6 lg:flex">
        <Brand />
        <div className="mt-8">
          <p className="px-3 pb-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Navigation
          </p>
          <NavList />
        </div>
        <div className="mt-auto rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="size-2 rounded-full bg-neon animate-pulse-glow" />
            Detection engine online
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
            Analysis runs locally in your browser. Nothing is stored unless you report it.
          </p>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close menu"
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 border-r border-sidebar-border bg-sidebar px-4 py-6">
            <div className="flex items-center justify-between">
              <Brand />
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="rounded-lg border border-border p-1.5 text-muted-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="mt-8">
              <NavList onNavigate={() => setOpen(false)} />
            </div>
          </div>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-border bg-surface/85 backdrop-blur">
          <div className="flex items-center gap-3 px-4 py-4 sm:px-6">
            <button
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="rounded-lg border border-border p-2 text-muted-foreground lg:hidden"
            >
              <Menu className="size-4" />
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold tracking-tight sm:text-xl">{title}</h1>
              {subtitle && (
                <p className="truncate text-xs text-muted-foreground sm:text-sm">{subtitle}</p>
              )}
            </div>
            <div className="ml-auto hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground sm:flex">
              <span className="size-1.5 rounded-full bg-neon animate-pulse-glow" />
              AI Scanner Active
            </div>
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
