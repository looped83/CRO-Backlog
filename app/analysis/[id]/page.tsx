"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { StoredAnalysis, Hypothesis } from "@/lib/schemas";
import ScoreCard from "@/components/ScoreCard";
import HypothesisTable from "@/components/HypothesisTable";
import HypothesisCard from "@/components/HypothesisCard";
import FilterBar, { type FilterState } from "@/components/FilterBar";
import { buildScoreBreakdown } from "@/lib/scoring";
import { exportAnalysisToMarkdown } from "@/lib/exportMarkdown";

export default function AnalysisPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [analysis, setAnalysis] = useState<StoredAnalysis | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    area: "All",
    impact: "All",
    effort: "All",
    confidence: "All",
  });
  const [view, setView] = useState<"cards" | "table">("cards");
  const [selectedHypothesis, setSelectedHypothesis] = useState<Hypothesis | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem(`analysis_${id}`);
    if (raw) {
      try {
        setAnalysis(JSON.parse(raw));
      } catch {
        router.push("/");
      }
    } else {
      router.push("/");
    }
  }, [id, router]);

  if (!analysis) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading...</div>
      </main>
    );
  }

  const { ai_analysis, extracted_data, url, page_type, conversion_goal, created_at } = analysis;
  const scoreBreakdown = buildScoreBreakdown(extracted_data, ai_analysis);

  const filteredHypotheses = ai_analysis.hypotheses.filter((h) => {
    if (filters.area !== "All" && h.area !== filters.area) return false;
    if (filters.impact !== "All" && h.expected_impact !== filters.impact) return false;
    if (filters.effort !== "All" && h.effort !== filters.effort) return false;
    if (filters.confidence !== "All" && h.confidence !== filters.confidence) return false;
    return true;
  });

  function downloadMarkdown() {
    const md = exportAnalysisToMarkdown(analysis!);
    const blob = new Blob([md], { type: "text/markdown" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = `cro-hypotheses-${new URL(url).hostname}.md`;
    a.click();
    URL.revokeObjectURL(href);
  }

  const displayUrl = url.length > 60 ? url.slice(0, 57) + "..." : url;

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => router.push("/")}
              className="text-gray-400 hover:text-gray-600 flex-shrink-0"
              title="New analysis"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div className="min-w-0">
              <p className="text-xs text-gray-400 truncate">{displayUrl}</p>
              <div className="flex items-center gap-2 flex-wrap">
                {page_type && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                    {page_type}
                  </span>
                )}
                {conversion_goal && (
                  <span className="text-xs bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded">
                    Goal: {conversion_goal}
                  </span>
                )}
                <span className="text-xs text-gray-400">
                  {new Date(created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={downloadMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export MD
            </button>
            <button
              onClick={() => router.push("/")}
              className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              New Analysis
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Score card */}
        <ScoreCard
          score={ai_analysis.overall_score}
          summary={ai_analysis.summary}
          breakdown={scoreBreakdown}
        />

        {/* Filters + view toggle */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Hypothesis Backlog
              <span className="ml-2 text-sm font-normal text-gray-400">
                ({ai_analysis.hypotheses.length} hypotheses)
              </span>
            </h2>
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setView("cards")}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  view === "cards"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Cards
              </button>
              <button
                onClick={() => setView("table")}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  view === "table"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Table
              </button>
            </div>
          </div>

          <FilterBar
            filters={filters}
            onChange={setFilters}
            totalCount={ai_analysis.hypotheses.length}
            filteredCount={filteredHypotheses.length}
          />
        </div>

        {/* Hypothesis list */}
        {filteredHypotheses.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            No hypotheses match the current filters.
          </div>
        ) : view === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredHypotheses.map((h, i) => (
              <HypothesisCard key={h.id} hypothesis={h} rank={i + 1} />
            ))}
          </div>
        ) : (
          <HypothesisTable
            hypotheses={filteredHypotheses}
            onSelect={(h) => {
              setSelectedHypothesis(h);
              setView("cards");
            }}
          />
        )}

        {/* Page data summary (collapsible) */}
        <details className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <summary className="px-6 py-4 cursor-pointer text-sm font-semibold text-gray-700 hover:bg-gray-50 flex items-center justify-between">
            Page Data Snapshot
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="px-6 pb-6 pt-2 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            {[
              { label: "Title", value: extracted_data.title || "—" },
              { label: "H1", value: extracted_data.h1[0] || "MISSING" },
              { label: "Meta Description", value: extracted_data.meta_description || "MISSING" },
              { label: "CTA Count", value: String(extracted_data.cta_count) },
              { label: "Word Count", value: String(extracted_data.word_count) },
              { label: "Has FAQ", value: extracted_data.has_faq ? "Yes" : "No" },
              { label: "Risk Reducers", value: extracted_data.risk_reducers.join(", ") || "None" },
              { label: "Trust Indicators", value: String(extracted_data.trust_indicators.length) + " detected" },
              { label: "Social Proof", value: String(extracted_data.social_proof.length) + " items" },
              { label: "Form Fields", value: extracted_data.form_fields.join(", ") || "None" },
              { label: "HTTP Status", value: String(extracted_data.http_status) },
              { label: "Noindex", value: extracted_data.has_noindex ? "Yes" : "No" },
            ].map(({ label, value }) => (
              <div key={label} className="space-y-0.5">
                <dt className="text-xs text-gray-400 uppercase tracking-wide">{label}</dt>
                <dd className="text-sm text-gray-700 font-medium truncate" title={value}>{value}</dd>
              </div>
            ))}
          </div>
        </details>
      </div>
    </main>
  );
}
