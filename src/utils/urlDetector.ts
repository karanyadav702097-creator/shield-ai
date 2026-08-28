import { capScore, getRiskLevel, tipsFor, type AnalysisResult } from "./riskScorer";

const SHORTENERS = ["bit.ly", "tinyurl", "t.co", "goo.gl", "shorturl", "rb.gy", "cutt.ly", "is.gd"];
const BAD_TLDS = [".xyz", ".top", ".click", ".link", ".tk", ".ml", ".gq", ".cf"];
const BRANDS = [
  "sbi",
  "hdfc",
  "icici",
  "axis",
  "paytm",
  "phonepe",
  "googlepay",
  "amazon",
  "flipkart",
  "kotak",
  "netflix",
];
const SCAM_KEYWORDS = [
  "kyc",
  "verify",
  "free",
  "gift",
  "reward",
  "login",
  "update",
  "claim",
  "secure",
  "wallet",
];
const IP_REGEX = /^(?:\d{1,3}\.){3}\d{1,3}$/;

export interface UrlBreakdown {
  protocol: string;
  host: string;
  path: string;
  length: number;
  valid: boolean;
}

export function breakdownUrl(raw: string): UrlBreakdown {
  const value = (raw || "").trim();
  try {
    const withProto = /^https?:\/\//i.test(value) ? value : `http://${value}`;
    const u = new URL(withProto);
    return {
      protocol: /^https:\/\//i.test(value) ? "https" : "http",
      host: u.hostname,
      path: `${u.pathname}${u.search}` || "/",
      length: value.length,
      valid: true,
    };
  } catch {
    return { protocol: "unknown", host: value, path: "-", length: value.length, valid: false };
  }
}

export function analyzeUrl(raw: string): AnalysisResult & { breakdown: UrlBreakdown } {
  const value = (raw || "").trim();
  const lower = value.toLowerCase();
  const breakdown = breakdownUrl(value);
  const reasons: string[] = [];
  let score = 0;

  if (!lower.startsWith("https://")) {
    score += 15;
    reasons.push("Missing HTTPS — the connection is not encrypted");
  }
  if (value.length > 75) {
    score += 10;
    reasons.push("Very long URL (often used to hide the real destination)");
  }
  const shortener = SHORTENERS.find((s) => lower.includes(s));
  if (shortener) {
    score += 15;
    reasons.push(`Uses a URL shortener (${shortener})`);
  }
  const badTld = BAD_TLDS.find((t) => breakdown.host.toLowerCase().endsWith(t));
  if (badTld) {
    score += 20;
    reasons.push(`Suspicious domain extension (${badTld})`);
  }
  if (IP_REGEX.test(breakdown.host)) {
    score += 25;
    reasons.push("Uses an IP address instead of a real domain name");
  }
  const brand = BRANDS.find((b) => lower.includes(b));
  if (brand) {
    score += 10;
    reasons.push(`Imitates a known brand or bank name (${brand})`);
  }
  const keywords = SCAM_KEYWORDS.filter((k) => lower.includes(k));
  if (keywords.length) {
    score += 10;
    reasons.push(`Contains scam keywords (${keywords.slice(0, 4).join(", ")})`);
  }
  const specials = (value.match(/[@%$~*=_\-?&]/g) || []).length;
  if (specials > 6) {
    score += 10;
    reasons.push("Contains an unusual number of special characters");
  }
  if (!breakdown.valid) {
    score += 10;
    reasons.push("URL structure could not be parsed correctly");
  }

  const riskScore = capScore(score);
  const riskLevel = getRiskLevel(riskScore);

  let category = "Phishing Link";
  if (brand && keywords.some((k) => k === "kyc" || k === "verify" || k === "update"))
    category = "Fake Bank/KYC Scam";
  else if (keywords.some((k) => k === "reward" || k === "gift" || k === "claim" || k === "free"))
    category = "Fake Lottery/Reward Scam";
  else if (lower.includes("upi") || lower.includes("wallet")) category = "UPI/Payment Scam";

  if (riskScore <= 30 && reasons.length === 0) {
    category = "Safe";
    reasons.push("No common phishing indicators were detected in this URL");
  }

  return { riskScore, riskLevel, category, reasons, safetyTips: tipsFor(category), breakdown };
}
