import type { ExtractedPageData, AnalysisResult } from "./schemas";

export interface ScoreBreakdown {
  overall: number;
  dimensions: { label: string; score: number; max: number }[];
}

// Quick local heuristic score supplement (the AI also returns overall_score)
export function computeHeuristicScore(data: ExtractedPageData): number {
  let score = 0;
  const max = 100;

  // Title & meta (10 pts)
  if (data.title) score += 5;
  if (data.meta_description) score += 5;

  // H1 (10 pts)
  if (data.h1.length === 1) score += 10;
  else if (data.h1.length > 1) score += 5;

  // CTAs (20 pts)
  if (data.cta_count >= 1) score += 10;
  if (data.cta_count >= 2) score += 5;
  if (data.cta_count <= 5) score += 5; // not too many

  // Trust (15 pts)
  score += Math.min(data.trust_indicators.length * 3, 15);

  // Risk reducers (10 pts)
  score += Math.min(data.risk_reducers.length * 5, 10);

  // Social proof (10 pts)
  score += Math.min(data.social_proof.length * 3, 10);

  // Forms reasonable (10 pts)
  if (data.form_fields.length > 0 && data.form_fields.length <= 5) score += 10;
  else if (data.form_fields.length > 5) score += 5;

  // Headings structure (5 pts)
  if (data.h2_h3.length >= 2) score += 5;

  // Word count reasonable (5 pts)
  if (data.word_count >= 200 && data.word_count <= 2000) score += 5;

  // FAQ (5 pts)
  if (data.has_faq) score += 5;

  return Math.round(Math.min(score, max));
}

export function buildScoreBreakdown(
  data: ExtractedPageData,
  analysisResult: AnalysisResult
): ScoreBreakdown {
  return {
    overall: analysisResult.overall_score,
    dimensions: [
      {
        label: "Messaging",
        score: data.h1.length > 0 && data.meta_description ? 70 : 30,
        max: 100,
      },
      {
        label: "CTA Clarity",
        score: data.cta_count >= 1 ? Math.min(data.cta_count * 20, 80) : 10,
        max: 100,
      },
      {
        label: "Trust & Credibility",
        score: Math.min(data.trust_indicators.length * 15, 80),
        max: 100,
      },
      {
        label: "Risk Reduction",
        score: Math.min(data.risk_reducers.length * 25, 80),
        max: 100,
      },
      {
        label: "Social Proof",
        score: Math.min(data.social_proof.length * 20, 80),
        max: 100,
      },
      {
        label: "Form Friction",
        score:
          data.form_fields.length === 0
            ? 50
            : data.form_fields.length <= 3
            ? 80
            : data.form_fields.length <= 6
            ? 55
            : 25,
        max: 100,
      },
    ],
  };
}
