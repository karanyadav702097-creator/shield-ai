// Real machine-learning classification that runs entirely in the visitor's browser
// using transformers.js (Hugging Face). No API key, no server cost, no per-request
// billing — the model is downloaded once from the Hugging Face CDN and cached by
// the browser afterwards. This replaces "does this text contain word X" with a
// model that actually understands meaning, so it isn't limited to a fixed list of
// hard-coded phrases and can generalize to scam wording it has never seen before.

export type AICategory =
  | "Phishing Link"
  | "Fake Bank/KYC Scam"
  | "OTP/PIN Fraud"
  | "UPI/Payment Scam"
  | "Fake Lottery/Reward Scam"
  | "Fake Job/Internship Scam"
  | "Fake Customer Care Scam"
  | "Delivery/Courier Scam"
  | "Investment/Crypto Scam"
  | "Safe";

const CANDIDATE_LABELS: Record<string, AICategory> = {
  "a phishing link trying to steal login details": "Phishing Link",
  "a fake bank or KYC identity verification scam": "Fake Bank/KYC Scam",
  "a scam asking to share an OTP, PIN or password": "OTP/PIN Fraud",
  "a fake UPI payment or money collect request scam": "UPI/Payment Scam",
  "a fake lottery, prize or reward scam": "Fake Lottery/Reward Scam",
  "a fake job or internship offer scam": "Fake Job/Internship Scam",
  "a fake customer support or remote access scam": "Fake Customer Care Scam",
  "a fake delivery or courier fee scam": "Delivery/Courier Scam",
  "an investment or cryptocurrency scam": "Investment/Crypto Scam",
  "a normal, safe, legitimate message with no scam intent": "Safe",
};

const LABELS = Object.keys(CANDIDATE_LABELS);

export interface AIClassification {
  topCategory: AICategory;
  topLabel: string;
  topConfidence: number; // 0..1
  safeConfidence: number; // 0..1
  allScores: { category: AICategory; score: number }[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ZeroShotPipeline = (text: string, labels: string[], options?: Record<string, unknown>) => Promise<any>;

let pipelinePromise: Promise<ZeroShotPipeline> | null = null;

/**
 * Lazily loads the zero-shot classification pipeline. Only ever called from a
 * client-side event handler (never during SSR), and only downloads the model
 * the first time it's used per browser session — cached by the browser after that.
 */
async function getPipeline(): Promise<ZeroShotPipeline> {
  if (typeof window === "undefined") {
    throw new Error("AI classifier can only run in the browser");
  }
  if (!pipelinePromise) {
    pipelinePromise = import("@xenova/transformers").then(async ({ pipeline, env }) => {
      // Always fetch model weights remotely from the HF CDN rather than expecting
      // local files to be bundled with the app.
      env.allowLocalModels = false;
      return pipeline("zero-shot-classification", "Xenova/nli-deberta-v3-xsmall") as unknown as ZeroShotPipeline;
    });
  }
  return pipelinePromise;
}

export function isAISupported(): boolean {
  return typeof window !== "undefined" && typeof WebAssembly !== "undefined";
}

export async function classifyMessageAI(text: string): Promise<AIClassification> {
  const classify = await getPipeline();
  const output = await classify(text, LABELS, { multi_label: true });

  const scored = (output.labels as string[]).map((label, i) => ({
    category: CANDIDATE_LABELS[label],
    score: output.scores[i] as number,
  }));
  scored.sort((a, b) => b.score - a.score);

  const safeEntry = scored.find((s) => s.category === "Safe");
  const topNonSafe = scored.find((s) => s.category !== "Safe") ?? scored[0];

  return {
    topCategory: topNonSafe.category,
    topLabel: topNonSafe.category,
    topConfidence: topNonSafe.score,
    safeConfidence: safeEntry?.score ?? 0,
    allScores: scored,
  };
}
