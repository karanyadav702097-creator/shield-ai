import { analyzeMessage } from "./fraudDetector";
import { classifyMessageAI, isAISupported, type AIClassification } from "./aiClassifier";
import { capScore, getRiskLevel, tipsFor, type AnalysisResult } from "./riskScorer";

export interface AIAnalysisResult extends AnalysisResult {
  usedAI: boolean;
  aiConfidence: number; // 0-100
}

/**
 * Produces the final result by blending two independent signals:
 *  1. The keyword heuristic (fraudDetector.ts) — instant, fully offline, and gives
 *     concrete, explainable reasons like "contains urgent language".
 *  2. A real ML model (aiClassifier.ts) running in the browser — understands
 *     meaning rather than exact wording, so it also catches scam messages that
 *     don't match any of the hard-coded phrase lists.
 *
 * The AI signal is weighted more heavily in the final score/category since it
 * generalizes; the heuristic reasons are always kept so results stay explainable.
 * If the model can't load (offline, unsupported browser, first-load still in
 * progress), this falls back to the heuristic result alone so the feature never
 * breaks — it only ever adds capability on top of what already worked.
 */
export async function analyzeMessageWithAI(rawInput: string): Promise<AIAnalysisResult> {
  const heuristic = analyzeMessage(rawInput);

  if (!isAISupported()) {
    return { ...heuristic, usedAI: false, aiConfidence: 0 };
  }

  let ai: AIClassification;
  try {
    ai = await classifyMessageAI(rawInput);
  } catch {
    return { ...heuristic, usedAI: false, aiConfidence: 0 };
  }

  const isAIScam = ai.topCategory !== "Safe";
  const aiScamScore = isAIScam ? ai.topConfidence * 100 : 0;

  // Weighted blend: AI carries more weight (60%) since it generalizes beyond
  // exact wording; the heuristic (40%) keeps fast, literal signals in the mix.
  let blendedScore = Math.round(heuristic.riskScore * 0.4 + aiScamScore * 0.6);

  // If the AI is confident the message is safe and no keyword signals fired,
  // trust that and pull the score down rather than letting either signal alone dominate.
  if (!isAIScam && ai.safeConfidence > 0.55 && heuristic.reasons.length === 0) {
    blendedScore = Math.min(blendedScore, 15);
  }

  const riskScore = capScore(blendedScore);
  const riskLevel = getRiskLevel(riskScore);

  // Category: trust the AI's classification when it's reasonably confident;
  // otherwise fall back to the heuristic's category so a low-confidence AI
  // guess never overrides clear keyword evidence.
  const category = isAIScam && ai.topConfidence > 0.33 ? ai.topCategory : heuristic.category;

  const reasons = [...heuristic.reasons];
  if (isAIScam) {
    reasons.push(
      `AI model recognized this as "${ai.topCategory}" (${Math.round(ai.topConfidence * 100)}% confidence)`,
    );
  } else if (ai.safeConfidence > 0.5) {
    reasons.push(
      `AI model found this consistent with normal, safe messages (${Math.round(ai.safeConfidence * 100)}% confidence)`,
    );
  }
  if (reasons.length === 0) {
    reasons.push("No known scam indicators were detected in this message");
  }

  const finalCategory = riskScore <= 30 && !isAIScam ? "Safe" : category;

  return {
    riskScore,
    riskLevel,
    category: finalCategory,
    reasons,
    safetyTips: tipsFor(finalCategory),
    usedAI: true,
    aiConfidence: Math.round((isAIScam ? ai.topConfidence : ai.safeConfidence) * 100),
  };
}
