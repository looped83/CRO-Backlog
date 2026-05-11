"use client";

import type { Hypothesis } from "@/lib/schemas";

interface HypothesisTableProps {
  hypotheses: Hypothesis[];
  onSelect: (h: Hypothesis) => void;
}

const LEVEL_DOTS: Record<string, string> = {
  high: "🔴",
  medium: "🟡",
  low: "🟢",
};

export default function HypothesisTable({ hypotheses, onSelect }: HypothesisTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-8">#</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Title</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Area</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">ICE</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Impact</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Effort</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Confidence</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {hypotheses.map((h, index) => (
            <tr
              key={h.id}
              onClick={() => onSelect(h)}
              className="hover:bg-indigo-50 cursor-pointer transition-colors"
            >
              <td className="px-4 py-3 text-gray-400 font-mono text-xs">{h.priority_rank}</td>
              <td className="px-4 py-3">
                <div className="font-medium text-gray-900 leading-snug">{h.title}</div>
                <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">{h.observed_issue}</div>
              </td>
              <td className="px-4 py-3 hidden sm:table-cell">
                <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                  {h.area}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <span className="font-bold text-indigo-600">{h.ice_score}</span>
                <span className="text-gray-300 text-xs">/10</span>
              </td>
              <td className="px-4 py-3 text-center hidden md:table-cell">
                {LEVEL_DOTS[h.expected_impact]}
              </td>
              <td className="px-4 py-3 text-center hidden md:table-cell">
                {LEVEL_DOTS[h.effort]}
              </td>
              <td className="px-4 py-3 text-center hidden md:table-cell">
                {LEVEL_DOTS[h.confidence]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
