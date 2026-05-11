"use client";

import type { HypothesisArea, ImpactLevel } from "@/lib/schemas";

export interface FilterState {
  area: HypothesisArea | "All";
  impact: ImpactLevel | "All";
  effort: ImpactLevel | "All";
  confidence: ImpactLevel | "All";
}

interface FilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  totalCount: number;
  filteredCount: number;
}

const AREAS: (HypothesisArea | "All")[] = [
  "All",
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
];

const LEVELS: (ImpactLevel | "All")[] = ["All", "high", "medium", "low"];

function FilterChips<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mr-1 w-16 flex-shrink-0">
        {label}
      </span>
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
            value === opt
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {opt === "All" ? "All" : opt.charAt(0).toUpperCase() + opt.slice(1)}
        </button>
      ))}
    </div>
  );
}

export default function FilterBar({
  filters,
  onChange,
  totalCount,
  filteredCount,
}: FilterBarProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Filter Hypotheses</h3>
        <span className="text-xs text-gray-500">
          {filteredCount === totalCount
            ? `${totalCount} hypotheses`
            : `${filteredCount} of ${totalCount}`}
        </span>
      </div>

      <div className="space-y-2">
        <FilterChips
          label="Area"
          options={AREAS}
          value={filters.area}
          onChange={(v) => onChange({ ...filters, area: v })}
        />
        <FilterChips
          label="Impact"
          options={LEVELS}
          value={filters.impact}
          onChange={(v) => onChange({ ...filters, impact: v })}
        />
        <FilterChips
          label="Effort"
          options={LEVELS}
          value={filters.effort}
          onChange={(v) => onChange({ ...filters, effort: v })}
        />
        <FilterChips
          label="Confidence"
          options={LEVELS}
          value={filters.confidence}
          onChange={(v) => onChange({ ...filters, confidence: v })}
        />
      </div>

      {(filters.area !== "All" ||
        filters.impact !== "All" ||
        filters.effort !== "All" ||
        filters.confidence !== "All") && (
        <button
          onClick={() =>
            onChange({ area: "All", impact: "All", effort: "All", confidence: "All" })
          }
          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
