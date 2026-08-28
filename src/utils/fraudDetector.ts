import { capScore, getRiskLevel, tipsFor, type AnalysisResult } from "./riskScorer";

const URGENT_WORDS = [
  "urgent",
  "immediately",
  "act now",
  "last warning",
  "verify now",
  "within 24 hours",
  "final notice",
];
const BLOCK_WORDS = [
  "account blocked",
  "blocked today",
  "will be blocked",
  "suspend",
  "suspended",
  "deactivate",
  "deactivated",
  "frozen",
];
const SENSITIVE_WORDS = [
  "otp",
  "pin",
  "password",
  "cvv",
  "card number",
  "bank details",
  "atm pin",
  "net banking",
];
const REWARD_WORDS = [
  "lottery",
  "winner",
  "you won",
  "free gift",
  "cash prize",
  "reward",
  "congratulations",
  "lucky draw",
];
const BANKING_WORDS = [
  "kyc",
  "bank",
  "account",
  "upi",
  "payment",
  "debit card",
  "credit card",
  "ifsc",
  "netbanking",
];
const JOB_WORDS = [
  "job offer",
  "internship",
  "registration fee",
  "work from home",
  "you are selected",
  "selected for",
  "part time job",
];
const UPI_WORDS = [
  "collect request",
  "upi pin",
  "phonepe",
  "google pay",
  "paytm",
  "scan qr",
  "gpay",
];
const SUPPORT_WORDS = [
  "customer care",
  "helpline",
  "support executive",
  "anydesk",
  "teamviewer",
  "quick support",
];
const COURIER_WORDS = ["parcel", "courier", "delivery", "shipment", "customs", "package on hold"];
const INVEST_WORDS = [
  "crypto",
  "bitcoin",
  "trading",
  "investment",
  "double your money",
  "guaranteed return",
  "profit daily",
];

const LINK_REGEX =
  /(https?:\/\/[^\s]+|www\.[^\s]+|\b[a-z0-9-]+\.(com|net|org|xyz|top|click|link|tk|ml|in|co)\b[^\s]*)/i;

function hit(text: string, list: string[]): string[] {
  return list.filter((w) => text.includes(w));
}

export function analyzeMessage(rawInput: string): AnalysisResult {
  const text = (rawInput || "").toLowerCase();
  const reasons: string[] = [];
  let score = 0;

  const urgent = hit(text, URGENT_WORDS);
  const blocking = hit(text, BLOCK_WORDS);
  const sensitive = hit(text, SENSITIVE_WORDS);
  const reward = hit(text, REWARD_WORDS);
  const banking = hit(text, BANKING_WORDS);
  const job = hit(text, JOB_WORDS);
  const upi = hit(text, UPI_WORDS);
  const support = hit(text, SUPPORT_WORDS);
  const courier = hit(text, COURIER_WORDS);
  const invest = hit(text, INVEST_WORDS);
  const hasLink = LINK_REGEX.test(rawInput || "");

  if (urgent.length) {
    score += 10;
    reasons.push(`Contains urgent language (${urgent.slice(0, 3).join(", ")})`);
  }
  if (blocking.length) {
    score += 15;
    reasons.push("Threatens account blocking or suspension");
  }
  if (sensitive.length) {
    score += 25;
    reasons.push(`Requests sensitive data (${sensitive.slice(0, 3).join(", ").toUpperCase()})`);
  }
  if (reward.length) {
    score += 15;
    reasons.push("Uses reward, prize or lottery wording");
  }
  if (banking.length) {
    score += 10;
    reasons.push(`Mentions banking or payment terms (${banking.slice(0, 3).join(", ")})`);
  }
  if (job.length) {
    score += 10;
    reasons.push("Contains fake job / internship wording");
  }
  if (upi.length) {
    score += 10;
    reasons.push("References UPI apps or collect requests");
  }
  if (support.length) {
    score += 10;
    reasons.push("Mentions customer care or remote-access apps");
  }
  if (courier.length) {
    score += 8;
    reasons.push("Mentions parcel or courier delivery");
  }
  if (invest.length) {
    score += 12;
    reasons.push("Promotes investment or crypto returns");
  }
  if (hasLink) {
    score += 20;
    reasons.push("Contains a link that may lead to a phishing site");
  }

  // Combination escalations: several weak signals together are a strong signal.
  if (blocking.length && hasLink) {
    score += 10;
    reasons.push("Combines a threat with a link — a classic phishing pattern");
  }
  if (reasons.length >= 4) {
    score += 10;
    reasons.push("Multiple independent scam indicators found together");
  }

  const riskScore = capScore(score);
  const riskLevel = getRiskLevel(riskScore);

  let category = "Other";
  if (sensitive.length && (banking.length || upi.length)) category = "OTP/PIN Fraud";
  else if (banking.some((w) => w === "kyc") || (banking.length && blocking.length))
    category = "Fake Bank/KYC Scam";
  else if (reward.length) category = "Fake Lottery/Reward Scam";
  else if (job.length) category = "Fake Job/Internship Scam";
  else if (upi.length) category = "UPI/Payment Scam";
  else if (invest.length) category = "Investment/Crypto Scam";
  else if (support.length) category = "Fake Customer Care Scam";
  else if (courier.length) category = "Delivery/Courier Scam";
  else if (hasLink) category = "Phishing Link";
  else if (banking.length) category = "Fake Bank/KYC Scam";

  if (riskScore <= 30 && reasons.length === 0) {
    category = "Safe";
    reasons.push("No known scam indicators were detected in this message");
  }

  return { riskScore, riskLevel, category, reasons, safetyTips: tipsFor(category) };
}
