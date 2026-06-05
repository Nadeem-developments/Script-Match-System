"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import ResultCard from "@/components/ResultCard";

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const id = searchParams.get("id");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        const res = await fetch(`/api/compare?id=${id}`);
        const json = await res.json();

        if (json.success && json.data) {
          const r = json.data;

          setData({
            score: r.similarityScore ?? 0,
            verdict: r.verdict ?? "Unknown",

            stroke: r.metrics?.strokePathConsistency ?? "0%",

            slant: r.metrics?.slantAngleMatching ?? "0%",

            spacing: r.metrics?.letterSpacingProportions ?? "0%",

            justification: r.justification ?? "No analysis available",
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Delete this report?")) return;

    await fetch(`/api/compare/${id}`, {
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
    <Suspense fallback={null}>
      <ResultsContent />
    </Suspense>
  );
}
