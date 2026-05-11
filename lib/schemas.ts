import { z } from "zod";

export const HypothesisAreaSchema = z.enum([
  "Messaging",
  "CTA",
  "Trust",
  "UX Friction",
  "Form",
  "Social Proof",
  "Risk Reduction",
  "Information Architecture",
  "Pricing",
  "Objection Handling",
]);

export const ImpactLevelSchema = z.enum(["low", "medium", "high"]);

export const HypothesisSchema = z.object({
  id: z.string(),
  title: z.string(),
  area: HypothesisAreaSchema,
  observed_issue: z.string(),
  hypothesis: z.string(),
  why_it_matters: z.string(),
  recommended_test: z.string(),
  example_variant_copy: z.string().nullable(),
  expected_impact: ImpactLevelSchema,
  confidence: ImpactLevelSchema,
  effort: ImpactLevelSchema,
  ice_score: z.number().min(1).max(10),
  priority_rank: z.number(),
  affected_page_element: z.string(),
  evidence_from_page: z.string(),
});

export const AnalysisResultSchema = z.object({
  overall_score: z.number().min(0).max(100),
  summary: z.string(),
  hypotheses: z.array(HypothesisSchema),
});

export const ExtractedPageDataSchema = z.object({
  url: z.string(),
  title: z.string(),
  meta_description: z.string().nullable(),
  canonical_url: z.string().nullable(),
  h1: z.array(z.string()),
  h2_h3: z.array(z.string()),
  hero_text: z.string().nullable(),
  cta_texts: z.array(z.string()),
  cta_links: z.array(z.string()),
  cta_count: z.number(),
  nav_links: z.array(z.string()),
  form_fields: z.array(z.string()),
  trust_indicators: z.array(z.string()),
  pricing_mentions: z.array(z.string()),
  risk_reducers: z.array(z.string()),
  social_proof: z.array(z.string()),
  has_faq: z.boolean(),
  body_copy: z.string(),
  word_count: z.number(),
  internal_links: z.array(z.string()),
  external_links: z.array(z.string()),
  http_status: z.number(),
  load_success: z.boolean(),
  has_noindex: z.boolean(),
});

export const AnalysisRequestSchema = z.object({
  url: z.string().url(),
  page_type: z.string().optional(),
  conversion_goal: z.string().optional(),
  target_audience: z.string().optional(),
});

export const StoredAnalysisSchema = z.object({
  id: z.string(),
  url: z.string(),
  page_type: z.string().optional(),
  conversion_goal: z.string().optional(),
  target_audience: z.string().optional(),
  extracted_data: ExtractedPageDataSchema,
  ai_analysis: AnalysisResultSchema,
  overall_score: z.number(),
  created_at: z.string(),
});

export type Hypothesis = z.infer<typeof HypothesisSchema>;
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;
export type ExtractedPageData = z.infer<typeof ExtractedPageDataSchema>;
export type AnalysisRequest = z.infer<typeof AnalysisRequestSchema>;
export type StoredAnalysis = z.infer<typeof StoredAnalysisSchema>;
export type HypothesisArea = z.infer<typeof HypothesisAreaSchema>;
export type ImpactLevel = z.infer<typeof ImpactLevelSchema>;
