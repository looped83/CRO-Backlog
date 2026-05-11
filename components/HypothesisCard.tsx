"use client";

import { useState } from "react";
import type { Hypothesis } from "@/lib/schemas";

interface HypothesisCardProps {
  hypothesis: Hypothesis;
  rank: number;
}

const AREA_COLORS: Record<string, string> = {
  Messaging: "bg-blue-100 text-blue-800",
  CTA: "bg-purple-100 text-purple-800",
  Trust: "bg-green-100 text-green-800",
  "UX Friction": "bg-orange-100 text-orange-800",
  Form: "bg-pink-100 text-pink-800",
  "Social Proof": "bg-teal-100 text-teal-800",
  "Risk Reduction": "bg-emerald-100 text-emerald-800",
  "Information Architecture": "bg-cyan-100 text-cyan-800",
  Pricing: "bg-yellow-100 text-yellow-800",
  "Objection Handling": "bg-red-100 text-red-800",
};

const LEVEL_COLORS = {
  high: "text-red-600 bg-red-50",
  medium: "text-yellow-600 bg-yellow-50",
  low: "text-green-600 bg-green-50",
};

function LevelBadge({ level }: { level: "low" | "medium" | "high" }) {
  return (
    <span
      className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${LEVEL_COLORS[level]}`}
    >
      {level}
    </span>
  );
}

export default function HypothesisCard({ hypothesis: h, rank }: HypothesisCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const areaColor = AREA_COLORS[h.area] ?? "bg-gray-100 text-gray-700";

  async function copyHypothesis() {
    const text = [
      `# ${h.title}`,
      ``,
      `**Area:** ${h.area}`,
      `**ICE Score:** ${h.ice_score}/10`,
      ``,
      `**Observed Issue:** ${h.observed_issue}`,
      ``,
      `**Hypothesis:** ${h.hypothesis}`,
      ``,
      `**Why It Matters:** ${h.why_it_matters}`,
      ``,
      `**Recommended Test:** ${h.recommended_test}`,
      h.example_variant_copy
        ? `\n**Example Copy:** ${h.example_variant_copy}`
        : "",
      ``,
      `**Evidence:** ${h.evidence_from_page}`,
    ]
      .filter((l) => l !== undefined)
      .join("\n");

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold">
            {rank}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 leading-snug">
              {h.title}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${areaColor}`}>
                {h.area}
              </span>
              <span className="text-xs text-gray-500">
                ICE <span className="font-semibold text-gray-700">{h.ice_score}</span>/10
              </span>
              <span className="text-xs text-gray-400">·</span>
              <span className="text-xs text-gray-500">{h.affected_page_element}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={copyHypothesis}
              title="Copy hypothesis"
              className="p-1.5 rounded-md text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              {copied ? (
                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Impact/Confidence/Effort */}
        <div className="flex gap-3 text-xs">
          <div className="space-y-0.5">
            <div className="text-gray-400 uppercase tracking-wide" style={{ fontSize: "10px" }}>Impact</div>
            <LevelBadge level={h.expected_impact} />
          </div>
          <div className="space-y-0.5">
            <div className="text-gray-400 uppercase tracking-wide" style={{ fontSize: "10px" }}>Confidence</div>
            <LevelBadge level={h.confidence} />
          </div>
          <div className="space-y-0.5">
            <div className="text-gray-400 uppercase tracking-wide" style={{ fontSize: "10px" }}>Effort</div>
            <LevelBadge level={h.effort} />
          </div>
        </div>

        {/* Issue summary */}
        <p className="text-sm text-gray-600 leading-relaxed">{h.observed_issue}</p>
      </div>

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-2 bg-gray-50 hover:bg-gray-100 text-xs font-medium text-gray-500 flex items-center justify-center gap-1 transition-colors border-t border-gray-100"
      >
        {expanded ? "▲ Show less" : "▼ Show full hypothesis"}
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="p-4 space-y-4 border-t border-gray-100 bg-gray-50">
          <section className="space-y-1">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Hypothesis</h4>
            <p className="text-sm text-gray-700 italic leading-relaxed">{h.hypothesis}</p>
          </section>

          <section className="space-y-1">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Why It Matters</h4>
            <p className="text-sm text-gray-700 leading-relaxed">{h.why_it_matters}</p>
          </section>

          <section className="space-y-1">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Recommended Test</h4>
            <p className="text-sm text-gray-700 leading-relaxed">{h.recommended_test}</p>
          </section>

          {h.example_variant_copy && (
            <section className="space-y-1">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Example Variant Copy</h4>
              <blockquote className="border-l-3 border-indigo-400 pl-3 text-sm text-gray-700 italic bg-indigo-50 p-2 rounded-r-md">
                {h.example_variant_copy}
              </blockquote>
            </section>
          )}

          <section className="space-y-1">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Evidence from Page</h4>
            <p className="text-sm text-gray-600 leading-relaxed">{h.evidence_from_page}</p>
          </section>
        </div>
      )}
    </div>
  );
}
