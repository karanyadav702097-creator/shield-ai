# FraudShield AI

FraudShield AI is an AI-assisted online fraud detection assistant that helps
users detect suspicious messages, phishing URLs, fake payment requests, and
other online scams.

## Features

- **Message Analyzer** — paste any SMS/WhatsApp text and get an instant risk
  score with concrete reasons.
- **URL Analyzer** — detects shorteners, lookalike domains, IP-based hosts,
  and missing HTTPS.
- **Reputation Lookup** — search a phone number, UPI ID, or domain against
  community-submitted reports.
- **Report Scam** — submit a scam in one step; sensitive values are masked
  before storage.
- **Admin Dashboard** — review, verify, and triage submitted reports.

## Detection Engine

Risk scoring blends two independent signals:

1. A fast, fully offline keyword/heuristic engine (`src/utils/fraudDetector.ts`,
   `src/utils/urlDetector.ts`) that flags urgency language, OTP/PIN requests,
   suspicious URL structure, and more.
2. A real on-device AI model (`src/utils/aiClassifier.ts`, via
   [`@xenova/transformers`](https://github.com/xenova/transformers.js)) that
   runs zero-shot text classification directly in the browser — free, with no
   API key or server cost — so it can generalize beyond exact keyword matches.

The two signals are combined in `src/utils/aiFraudDetector.ts`. If the AI
model can't load, the app falls back cleanly to the keyword engine.

## Tech Stack

- React 19, TanStack Start & Router, Vite, TypeScript
- Tailwind CSS v4, shadcn/ui, Radix primitives
- Supabase (Postgres + Auth) with row-level security
- `@xenova/transformers` for in-browser AI classification

## Getting Started

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env` and fill in your Supabase project's URL and
publishable (anon) key:

```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

Database migrations live in `supabase/migrations/` — apply them via the
Supabase CLI (`supabase db push`) or by pasting them into the Supabase SQL
Editor.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run lint` — run ESLint
- `npm run format` — run Prettier
