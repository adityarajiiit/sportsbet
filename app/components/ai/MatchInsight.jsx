"use client";
import { Sparkles } from "lucide-react";
import { useMatchInsight } from "@/app/lib/aiclient";
import ReactMarkdown from "react-markdown";
export default function MatchInsight({ matchId }) {
  const { data, loading, generate } = useMatchInsight();
  return (
    <div className="mt-4 border border-base-content/20 rounded-xl bg-base-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="font-poppins font-semibold text-sm flex items-center gap-2">
          <Sparkles className="size-4 text-warning" />
          AI Match Insight
        </p>
        <button
          className="btn btn-sm btn-warning rounded-full font-poppins"
          onClick={() => generate(matchId)}
          disabled={loading || !matchId}
        >
          {loading ? (
            <span className="loading loading-spinner loading-xs" />
          ) : (
            "Generate"
          )}
        </button>
      </div>
      {data && !loading && (
        <div className="space-y-3 text-sm font-inter">
          {data.summary && (
            <div className="p-3 bg-base-300 rounded-lg">
              <p className="text-xs text-base-content/50 font-poppins mb-1">
                Summary
              </p>
              <ReactMarkdown>{data.summary}</ReactMarkdown>
            </div>
          )}
          {data.key_factors?.length > 0 && (
            <div className="p-3 bg-base-300 rounded-lg">
              <p className="text-xs text-base-content/50 font-poppins mb-1">
                Key Factors
              </p>
              <ul className="list-disc list-inside space-y-0.5">
                {data.key_factors.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          )}
          {data.recommendation && (
            <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
              <p className="text-xs text-warning font-poppins mb-1">
                AI Recommendation
              </p>
              <p className="font-medium">{data.recommendation}</p>
            </div>
          )}
        </div>
      )}
      {!data && !loading && (
        <p className="text-xs text-base-content/40 font-inter">
          Click Generate to get AI analysis for this match
        </p>
      )}
    </div>
  );
}
