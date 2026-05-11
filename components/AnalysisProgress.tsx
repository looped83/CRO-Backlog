"use client";

import { useEffect, useState } from "react";

const STEPS = [
  { id: "fetch", label: "Fetching page", duration: 2000 },
  { id: "extract", label: "Extracting content", duration: 1500 },
  { id: "detect", label: "Detecting elements", duration: 1000 },
  { id: "generate", label: "Generating hypotheses", duration: 8000 },
  { id: "prioritize", label: "Prioritizing backlog", duration: 1000 },
];

interface AnalysisProgressProps {
  url: string;
}

export default function AnalysisProgress({ url }: AnalysisProgressProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  useEffect(() => {
    let stepIndex = 0;
    let timer: ReturnType<typeof setTimeout>;

    function advance() {
      if (stepIndex >= STEPS.length) return;
      setCurrentStep(stepIndex);

      timer = setTimeout(() => {
        setCompletedSteps((prev) => new Set([...prev, stepIndex]));
        stepIndex++;
        advance();
      }, STEPS[stepIndex].duration);
    }

    advance();
    return () => clearTimeout(timer);
  }, []);

  const displayUrl =
    url.length > 50 ? url.slice(0, 47) + "..." : url;

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center space-y-1">
        <p className="text-sm text-gray-500">Analyzing</p>
        <p className="text-sm font-mono text-gray-700 truncate">{displayUrl}</p>
      </div>

      <div className="space-y-3">
        {STEPS.map((step, index) => {
          const isCompleted = completedSteps.has(index);
          const isActive = currentStep === index && !isCompleted;
          const isPending = index > currentStep;

          return (
            <div
              key={step.id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                isCompleted
                  ? "bg-green-50 text-green-800"
                  : isActive
                  ? "bg-indigo-50 text-indigo-800"
                  : "bg-gray-50 text-gray-400"
              }`}
            >
              <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
                {isCompleted ? (
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : isActive ? (
                  <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-gray-300" />
                )}
              </div>
              <span className={`text-sm font-medium ${isPending ? "text-gray-400" : ""}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-gray-400">
        This may take up to 30 seconds
      </p>
    </div>
  );
}
