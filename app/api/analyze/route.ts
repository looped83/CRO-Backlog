import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { AnalysisRequestSchema } from "@/lib/schemas";
import { crawlUrl } from "@/lib/crawler";
import { extractPageData } from "@/lib/extractor";
import { analyzeWithClaude } from "@/lib/aiAnalyzer";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = AnalysisRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { url, page_type, conversion_goal, target_audience } = parsed.data;

  // Step 1: Crawl
  const crawlResult = await crawlUrl(url);
  if (!crawlResult.success) {
    return NextResponse.json(
      { error: `Failed to fetch page: ${crawlResult.error}` },
      { status: 422 }
    );
  }

  // Step 2: Extract
  let extractedData;
  try {
    extractedData = extractPageData(
      crawlResult.html,
      crawlResult.url,
      crawlResult.status
    );
  } catch (err) {
    return NextResponse.json(
      { error: `Extraction failed: ${err instanceof Error ? err.message : "unknown"}` },
      { status: 500 }
    );
  }

  // Step 3: AI Analysis
  let aiAnalysis;
  try {
    aiAnalysis = await analyzeWithClaude(
      extractedData,
      page_type,
      conversion_goal,
      target_audience
    );
  } catch (err) {
    return NextResponse.json(
      { error: `AI analysis failed: ${err instanceof Error ? err.message : "unknown"}` },
      { status: 500 }
    );
  }

  const analysis = {
    id: uuidv4(),
    url: crawlResult.url,
    page_type,
    conversion_goal,
    target_audience,
    extracted_data: extractedData,
    ai_analysis: aiAnalysis,
    overall_score: aiAnalysis.overall_score,
    created_at: new Date().toISOString(),
  };

  return NextResponse.json(analysis, { status: 200 });
}
