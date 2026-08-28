import { createFileRoute } from "@tanstack/react-router";
import { KeyRound, MousePointerClick, BadgeCheck, Smartphone, Gift, Siren } from "lucide-react";
import { Layout } from "@/components/Layout";

export const Route = createFileRoute("/safety-tips")({
  head: () => ({
    meta: [
      { title: "Cyber Safety Tips — FraudShield AI" },
      {
        name: "description",
        content:
          "Simple cyber safety rules: never share OTPs, avoid unknown links, verify payment requests and report fraud fast.",
      },
      { property: "og:title", content: "Cyber Safety Tips — FraudShield AI" },
      { property: "og:description", content: "Practical rules to avoid online fraud." },
    ],
  }),
  component: SafetyTipsPage,
});

const TIPS = [
  {
    icon: KeyRound,
    title: "Never share OTP, PIN, CVV or passwords",
    body: "No bank, wallet or delivery company will ever ask for these — anyone who does is a fraudster.",
  },
  {
    icon: MousePointerClick,
    title: "Do not click unknown links",
    body: "Links can imitate real websites. Type the address yourself or use the official app instead.",
  },
  {
    icon: BadgeCheck,
    title: "Verify payment requests manually",
    body: "Call the person on a number you already have. You never approve a request to receive money.",
  },
  {
    icon: Smartphone,
    title: "Use official bank apps and websites only",
    body: "Install apps from official stores and check the publisher name before installing.",
  },
  {
    icon: Gift,
    title: "Do not trust urgent reward messages",
    body: "Prizes that demand a fee, urgency or personal data are always scams.",
  },
  {
    icon: Siren,
    title: "Report cyber fraud quickly",
    body: "Fast reporting improves recovery chances. Inform your bank and the national cybercrime helpline.",
  },
];

function SafetyTipsPage() {
  return (
    <Layout title="Cyber Safety Tips" subtitle="Six rules that stop most online fraud">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {TIPS.map((tip) => (
          <article
            key={tip.title}
            className="panel p-6 transition-transform duration-200 hover:-translate-y-1"
          >
            <span className="grid size-10 place-items-center rounded-xl border border-border bg-secondary text-neon">
              <tip.icon className="size-5" />
            </span>
            <h2 className="mt-4 text-base font-semibold text-foreground">{tip.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{tip.body}</p>
          </article>
        ))}
      </div>
    </Layout>
  );
}
