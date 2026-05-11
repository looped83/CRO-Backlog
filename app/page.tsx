"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import UrlInputForm from "@/components/UrlInputForm";
import AnalysisProgress from "@/components/AnalysisProgress";
import type { StoredAnalysis } from "@/lib/schemas";

type AppState = "idle" | "loading" | "error";

export default function Home() {
  const router = useRouter();
  const [state, setState] = useState<AppState>("idle");
  const [loadingUrl, setLoadingUrl] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(data: {
    url: string;
    page_type?: string;
    conversion_goal?: string;
    target_audience?: string;
  }) {
    setState("loading");
    setLoadingUrl(data.url);
    setError("");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || `Server error ${res.status}`);
      }

      const analysis = json as StoredAnalysis;
      sessionStorage.setItem(`analysis_${analysis.id}`, JSON.stringify(analysis));
      router.push(`/analysis/${analysis.id}`);
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (state === "loading") {
    return (
      <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-6">
        <AnalysisProgress url={loadingUrl} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full uppercase tracking-wide">
            AI-Powered CRO Analysis
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Turn any landing page into a<br />
            <span className="text-indigo-600">prioritized CRO backlog</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-lg mx-auto leading-relaxed">
            Paste a URL and get AI-generated, evidence-based CRO hypotheses ranked by ICE score — in under 30 seconds.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-semibold text-red-700">Analysis failed</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
              <button
                onClick={() => setState("idle")}
                className="mt-2 text-xs text-red-700 underline"
              >
                Try again
              </button>
            </div>
          )}
          <UrlInputForm onSubmit={handleSubmit} isLoading={false} />
        </div>

        <div className="flex flex-wrap justify-center gap-3 text-xs text-gray-500">
          {[
            "SaaS & Lead-gen pages",
            "ICE-scored hypotheses",
            "Evidence-based",
            "Export to Markdown",
            "No signup required",
          ].map((f) => (
            <span key={f} className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
              <span className="text-indigo-400">✓</span> {f}
            </span>
          ))}
        </div>
      </div>
    </main>
  );
}
