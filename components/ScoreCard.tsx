"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { ScoreBreakdown } from "@/lib/scoring";

interface ScoreCardProps {
  score: number;
  summary: string;
  breakdown: ScoreBreakdown;
}

function ScoreRing({ score }: { score: number }) {
  const color =
    score >= 70 ? "#16a34a" : score >= 45 ? "#d97706" : "#dc2626";
  const label =
    score >= 70 ? "Good" : score >= 45 ? "Needs Work" : "Critical Issues";

  return (
    <div className="flex flex-col items-center justify-center gap-1">
      <div
        className="text-5xl font-bold tabular-nums"
        style={{ color }}
      >
        {score}
      </div>
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        / 100
      </div>
      <span
        className="mt-1 text-xs font-semibold px-2 py-0.5 rounded-full"
        style={{
          color,
          backgroundColor: color + "20",
        }}
      >
        {label}
      </span>
    </div>
  );
}

export default function ScoreCard({ score, summary, breakdown }: ScoreCardProps) {
  const radarData = breakdown.dimensions.map((d) => ({
    subject: d.label,
    score: d.score,
  }));

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">CRO Score</h2>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Score ring + summary */}
        <div className="space-y-4">
          <ScoreRing score={score} />
          <p className="text-sm text-gray-600 leading-relaxed">{summary}</p>
        </div>

        {/* Radar chart */}
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fontSize: 11, fill: "#6b7280" }}
              />
              <Radar
                name="Score"
                dataKey="score"
                stroke="#6366f1"
                fill="#6366f1"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Tooltip
                formatter={(v) => [`${v}/100`, "Score"]}
                contentStyle={{ fontSize: 12 }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
