export type RiskLevel = "Low Risk" | "Medium Risk" | "High Risk";

export interface AnalysisResult {
  riskScore: number;
  riskLevel: RiskLevel;
  category: string;
  reasons: string[];
  safetyTips: string[];
}

export function capScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function getRiskLevel(score: number): RiskLevel {
  if (score <= 30) return "Low Risk";
  if (score <= 70) return "Medium Risk";
  return "High Risk";
}

export const GENERAL_SAFETY_TIPS = [
  "Never share your OTP, PIN, CVV or password with anyone.",
  "Do not click unknown or shortened links.",
  "Verify payment requests directly with the person or company.",
  "Use only official bank apps and websites.",
];

export const CATEGORY_TIPS: Record<string, string[]> = {
  "Fake Bank/KYC Scam": [
    "Banks never ask for KYC updates over SMS links.",
    "Open your bank app manually instead of clicking links.",
    "Call the official bank helpline printed on your card.",
  ],
  "OTP/PIN Fraud": [
    "An OTP is a password — no bank or company will ask for it.",
    "Never read out codes received on your phone.",
    "Block and report the sender immediately.",
  ],
  "Fake Lottery/Reward Scam": [
    "You cannot win a lottery you never entered.",
    "Never pay a fee to receive a prize.",
    "Ignore congratulation messages from unknown numbers.",
  ],
  "Fake Job/Internship Scam": [
    "Genuine employers never charge a registration fee.",
    "Verify the company on its official website before paying anything.",
    "Be cautious of instant selection without an interview.",
  ],
  "UPI/Payment Scam": [
    "You never need to approve a request to receive money.",
    "Check the payee name before approving any UPI request.",
    "Reject unexpected collect requests.",
  ],
  "Phishing Link": [
    "Check the exact spelling of the domain before entering details.",
    "Prefer typing the website address yourself.",
    "Never log in through links sent by strangers.",
  ],
  "Fake Customer Care Scam": [
    "Get support numbers only from official websites or apps.",
    "Never install remote-access apps at anyone's request.",
    "Support agents never ask for card details or OTPs.",
  ],
  "Delivery/Courier Scam": [
    "Track parcels using the courier's official app.",
    "Do not pay extra fees requested over SMS or WhatsApp.",
  ],
  "Investment/Crypto Scam": [
    "Guaranteed high returns are always a red flag.",
    "Use only regulated investment platforms.",
    "Never invest based on messages from strangers.",
  ],
  Other: GENERAL_SAFETY_TIPS,
  Safe: [
    "Stay alert even with safe-looking messages.",
    "Re-check the sender before taking any action.",
  ],
};

export function tipsFor(category: string): string[] {
  const tips = CATEGORY_TIPS[category] ?? GENERAL_SAFETY_TIPS;
  return [...new Set([...tips, ...GENERAL_SAFETY_TIPS])].slice(0, 5);
}

export const SCAM_CATEGORIES = [
  "Phishing Link",
  "Fake Bank/KYC Scam",
  "OTP/PIN Fraud",
  "UPI/Payment Scam",
  "Fake Lottery/Reward Scam",
  "Fake Job/Internship Scam",
  "Fake Customer Care Scam",
  "Delivery/Courier Scam",
  "Investment/Crypto Scam",
  "Other",
] as const;

export const REPORT_STATUSES = [
  "Pending",
  "Verified Scam",
  "False Report",
  "Under Review",
] as const;
