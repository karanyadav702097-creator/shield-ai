import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, LogIn, ShieldHalf } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Admin Login — FraudShield AI" },
      {
        name: "description",
        content: "Sign in to the FraudShield AI admin console to review scam reports.",
      },
      { property: "og:title", content: "Admin Login — FraudShield AI" },
      {
        property: "og:description",
        content: "Secure access to the FraudShield AI report console.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin", replace: true });
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const fn =
      mode === "signin"
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: `${window.location.origin}/admin` },
          });
    const { data, error } = await fn;
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }
    if (!data.session) {
      toast.success("Account created. Check your email to confirm, then sign in.");
      setMode("signin");
      return;
    }
    toast.success("Signed in.");
    navigate({ to: "/admin", replace: true });
  }

  return (
    <div className="grid-bg flex min-h-screen items-center justify-center px-4 py-12">
      <div className="panel w-full max-w-md p-8">
        <span className="grid size-11 place-items-center rounded-xl border border-border bg-card text-neon glow">
          <ShieldHalf className="size-5" />
        </span>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight">Admin access</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in to review and triage submitted scam reports.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@fraudshield.ai"
              className="h-11 bg-secondary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-11 bg-secondary"
            />
          </div>
          <Button type="submit" variant="neon" size="lg" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : <LogIn />}
            {mode === "signin" ? "Login" : "Create admin account"}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-5 w-full text-center text-xs text-muted-foreground underline underline-offset-4"
        >
          {mode === "signin"
            ? "No account yet? Create the first admin account"
            : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
