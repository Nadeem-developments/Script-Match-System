"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import ResultCard from "@/components/ResultCard";

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const id = searchParams.get("id");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    fetch(`/api/compare?id=${id}`)
      .then((res) => res.json())
      .then((json) => {
        console.log("API RESPONSE:", json);

        if (json.success && json.data) {
          const r = json.data;

          setData({
            score: r.similarityScore ?? 0,
            verdict: r.verdict ?? "Unknown",

            // ✅ FIXED MAPPING (NO N/A anymore)
            stroke:
              r.metrics?.strokePatternSimilarity ??
              r.metrics?.strokePathConsistency ??
              r.metrics?.strokeSimilarity ??
              "0%",

            slant:
              r.metrics?.hogSimilarity ??
              r.metrics?.slantAngleMatching ??
              r.metrics?.hogScore ??
              "0%",

            spacing:
              r.metrics?.structuralSimilarity ??
              r.metrics?.letterSpacingProportions ??
              r.metrics?.structureScore ??
              "0%",

            justification: r.justification ?? "No forensic analysis available",
          });
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this report?")) return;

    await fetch(`/api/compare/delete?id=${id}`, {
      method: "DELETE",
    });

    router.push("/history");
  };

  return (
    <div className='max-w-xl mx-auto p-6'>
      <button
        onClick={() => router.back()}
        className='mb-6 text-sm text-slate-500'>
        ← Back
      </button>

      {loading ? (
        <p className='text-center text-slate-400'>AI Processing...</p>
      ) : (
        <ResultCard data={data} id={id} onDelete={handleDelete} />
      )}
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense>
      <ResultsContent />
    </Suspense>
  );
}
