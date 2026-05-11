"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface UrlInputFormProps {
  onSubmit: (data: {
    url: string;
    page_type?: string;
    conversion_goal?: string;
    target_audience?: string;
  }) => void;
  isLoading: boolean;
}

const PAGE_TYPES = [
  { value: "", label: "Select page type (optional)" },
  { value: "SaaS landing page", label: "SaaS Landing Page" },
  { value: "Lead generation page", label: "Lead Generation Page" },
  { value: "Product page", label: "Product Page" },
  { value: "Pricing page", label: "Pricing Page" },
  { value: "Home page", label: "Home Page" },
];

const CONVERSION_GOALS = [
  { value: "", label: "Select conversion goal (optional)" },
  { value: "Free trial signup", label: "Free Trial Signup" },
  { value: "Demo request", label: "Demo Request" },
  { value: "Lead form submission", label: "Lead Form Submission" },
  { value: "Paid subscription", label: "Paid Subscription" },
  { value: "Newsletter signup", label: "Newsletter Signup" },
  { value: "Contact sales", label: "Contact Sales" },
];

export default function UrlInputForm({ onSubmit, isLoading }: UrlInputFormProps) {
  const [url, setUrl] = useState("");
  const [pageType, setPageType] = useState("");
  const [conversionGoal, setConversionGoal] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [urlError, setUrlError] = useState("");
  const [showOptional, setShowOptional] = useState(false);

  function validateUrl(value: string): boolean {
    try {
      const u = value.startsWith("http") ? value : `https://${value}`;
      new URL(u);
      return true;
    } catch {
      return false;
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) {
      setUrlError("Please enter a URL");
      return;
    }
    if (!validateUrl(trimmed)) {
      setUrlError("Please enter a valid URL (e.g. https://example.com)");
      return;
    }
    setUrlError("");
    const normalized = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
    onSubmit({
      url: normalized,
      page_type: pageType || undefined,
      conversion_goal: conversionGoal || undefined,
      target_audience: targetAudience || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      {/* URL Input */}
      <div className="space-y-2">
        <label htmlFor="url" className="block text-sm font-medium text-gray-700">
          Website URL
        </label>
        <div className="flex gap-3">
          <input
            id="url"
            type="text"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (urlError) setUrlError("");
            }}
            placeholder="https://yoursite.com/landing-page"
            className={cn(
              "flex-1 rounded-lg border px-4 py-3 text-sm shadow-sm transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
              urlError
                ? "border-red-400 bg-red-50"
                : "border-gray-300 bg-white hover:border-gray-400"
            )}
            disabled={isLoading}
            autoFocus
          />
          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className={cn(
              "px-6 py-3 rounded-lg text-sm font-semibold text-white transition-all",
              "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800",
              "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "shadow-sm"
            )}
          >
            {isLoading ? "Analyzing..." : "Analyze Page"}
          </button>
        </div>
        {urlError && (
          <p className="text-sm text-red-600">{urlError}</p>
        )}
      </div>

      {/* Optional fields toggle */}
      <button
        type="button"
        onClick={() => setShowOptional(!showOptional)}
        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
      >
        {showOptional ? "▾" : "▸"} {showOptional ? "Hide" : "Show"} optional context
      </button>

      {showOptional && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="pageType" className="block text-xs font-medium text-gray-600 uppercase tracking-wide">
                Page Type
              </label>
              <select
                id="pageType"
                value={pageType}
                onChange={(e) => setPageType(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isLoading}
              >
                {PAGE_TYPES.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="conversionGoal" className="block text-xs font-medium text-gray-600 uppercase tracking-wide">
                Conversion Goal
              </label>
              <select
                id="conversionGoal"
                value={conversionGoal}
                onChange={(e) => setConversionGoal(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isLoading}
              >
                {CONVERSION_GOALS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="targetAudience" className="block text-xs font-medium text-gray-600 uppercase tracking-wide">
              Target Audience
            </label>
            <input
              id="targetAudience"
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g. B2B marketers at mid-size companies"
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isLoading}
            />
          </div>
        </div>
      )}
    </form>
  );
}
