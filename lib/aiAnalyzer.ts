import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { AnalysisResultSchema, type AnalysisResult, type ExtractedPageData } from "./schemas";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are a world-class CRO (Conversion Rate Optimization) strategist specializing in SaaS and lead-generation landing pages.

Your task is to analyze extracted page data and generate a prioritized backlog of CRO hypotheses.

CRITICAL: Respond ONLY with valid JSON matching the schema below. No markdown, no explanation, no prose.

JSON Schema:
{
  "overall_score": number (0-100, CRO readiness score),
  "summary": string (2-3 sentence executive summary of key issues),
  "hypotheses": [
    {
      "id": string (e.g. "H001"),
      "title": string (concise hypothesis title),
      "area": one of ["Messaging", "CTA", "Trust", "UX Friction", "Form", "Social Proof", "Risk Reduction", "Information Architecture", "Pricing", "Objection Handling"],
      "observed_issue": string (what is wrong or missing),
      "hypothesis": string ("If we [change], then [outcome] because [reason]"),
      "why_it_matters": string (business impact explanation),
      "recommended_test": string (specific A/B test recommendation),
      "example_variant_copy": string or null (concrete copy example if applicable),
      "expected_impact": "low" | "medium" | "high",
      "confidence": "low" | "medium" | "high",
      "effort": "low" | "medium" | "high",
      "ice_score": number (1-10, ICE = Impact × Confidence / Effort),
      "priority_rank": number (1 = highest priority),
      "affected_page_element": string (e.g. "Hero headline", "Primary CTA button"),
      "evidence_from_page": string (specific evidence from the extracted data)
    }
  ]
}

Rules:
- Generate 6-12 hypotheses minimum, prioritized by ICE score
- Be specific and actionable. No vague suggestions like "improve UX"
- Base ALL observations on the actual extracted data provided
- ICE scores must be internally consistent (high impact + high confidence + low effort = high ICE)
- Priority rank 1 = highest ICE score`;

function buildUserPrompt(
  data: ExtractedPageData,
  pageType?: string,
  conversionGoal?: string,
  targetAudience?: string
): string {
  const ctx = [
    pageType ? `Page type: ${pageType}` : null,
    conversionGoal ? `Conversion goal: ${conversionGoal}` : null,
    targetAudience ? `Target audience: ${targetAudience}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return `Analyze this page for CRO opportunities.
${ctx ? `\nCONTEXT:\n${ctx}\n` : ""}
EXTRACTED PAGE DATA:
URL: ${data.url}
Title: ${data.title}
Meta description: ${data.meta_description || "MISSING"}
H1 headings: ${data.h1.join(" | ") || "NONE"}
H2/H3 headings: ${data.h2_h3.slice(0, 10).join(" | ") || "NONE"}
Hero text: ${data.hero_text?.slice(0, 300) || "Not detected"}
CTA texts (${data.cta_count}): ${data.cta_texts.slice(0, 8).join(" | ") || "NONE DETECTED"}
Form fields: ${data.form_fields.join(", ") || "NONE"}
Trust indicators: ${data.trust_indicators.join(", ") || "NONE"}
Pricing mentions: ${data.pricing_mentions.join(", ") || "NONE"}
Risk reducers: ${data.risk_reducers.join(", ") || "NONE"}
Social proof snippets: ${data.social_proof.slice(0, 3).join(" | ") || "NONE"}
Has FAQ: ${data.has_faq}
Word count: ${data.word_count}
Nav links: ${data.nav_links.slice(0, 8).join(", ")}
HTTP status: ${data.http_status}
Has noindex: ${data.has_noindex}
Body copy excerpt: ${data.body_copy.slice(0, 1500)}

Generate your CRO hypothesis backlog now. Return ONLY valid JSON.`;
}

export async function analyzeWithClaude(
  data: ExtractedPageData,
  pageType?: string,
  conversionGoal?: string,
  targetAudience?: string
): Promise<AnalysisResult> {
  const userPrompt = buildUserPrompt(data, pageType, conversionGoal, targetAudience);

  let rawJson = "";

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  for (const block of response.content) {
    if (block.type === "text") {
      rawJson = block.text.trim();
      break;
    }
  }

  // Strip markdown code fences if model adds them
  rawJson = rawJson.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    throw new Error(`AI returned invalid JSON: ${rawJson.slice(0, 200)}`);
  }

  const validated = AnalysisResultSchema.safeParse(parsed);
  if (!validated.success) {
    // Attempt to coerce common issues (numeric strings, missing nulls)
    throw new Error(
      `AI response failed Zod validation: ${validated.error.message}`
    );
  }

  // Sort by priority_rank ascending
  validated.data.hypotheses.sort((a, b) => a.priority_rank - b.priority_rank);

  return validated.data;
}
