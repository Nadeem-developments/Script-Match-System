"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useEffect } from "react";

// ==========================================
// 📜 CHILD COMPONENT: RESULT CARD DIKHLANE KE LIYE
// ==========================================
function ResultCard({ data }) {
  if (!data) return null;

  return (
    <div className='bg-[#fcfbfa]/90 backdrop-blur-sm border border-white/60 rounded-[32px] shadow-2xl p-8 space-y-8 max-w-md mx-auto transition-all hover:scale-[1.01]'>
      {/* Header */}
      <div className='text-center space-y-1'>
        <h1 className='text-3xl font-bold tracking-tight text-[#3b63b8]'>
          Analysis Result
        </h1>
        <div className='w-12 h-1 bg-amber-700/30 mx-auto rounded-full'></div>
      </div>

      {/* Main Score & Verdict */}
      <div className='bg-[#f4f0ea] border border-white/40 p-8 rounded-[24px] flex flex-col items-center justify-center shadow-inner'>
        <div className='text-7xl font-black text-[#3b63b8] drop-shadow-sm'>
          {data.score}%
        </div>
        <div className='mt-2 px-4 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-semibold border border-emerald-100'>
          {data.verdict}
        </div>
      </div>

      {/* AI Justification Box */}
      <div className='bg-blue-50/40 p-5 rounded-2xl border border-blue-100/50 relative overflow-hidden'>
        <div className='absolute top-0 left-0 w-1 h-full bg-[#4f6bf2]/40'></div>
        <h3 className='font-bold text-[#3b63b8] text-xs uppercase tracking-wider mb-2'>
          AI Expert Justification
        </h3>
        <p className='text-slate-600 text-sm leading-relaxed'>
          {data.justification || "No justification available."}
        </p>
      </div>

      {/* Metrics Bento Grid */}
      <div className='grid grid-cols-3 gap-4'>
        {[
          { label: "Stroke", value: data.stroke },
          { label: "Slant", value: data.slant },
          { label: "Spacing", value: data.spacing },
        ].map((m) => (
          <div
            key={m.label}
            className='bg-white/60 p-4 rounded-2xl text-center border border-white shadow-sm hover:bg-white transition-colors'>
            <p className='text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1'>
              {m.label}
            </p>
            <p
              className='font-bold text-slate-800 text-xs truncate'
              title={m.value}>
              {m.value || "-"}
            </p>
          </div>
        ))}
      </div>

      {/* Footer Branding */}
      <div className='pt-4 text-center'>
        <span className='text-[10px] text-slate-400 uppercase tracking-[0.2em] font-medium'>
          Verified by AI Engine
        </span>
      </div>
    </div>
  );
}

// ==========================================
// ⚙️ MAIN CONTENT COMPONENT: DATA HANDLING
// ==========================================
function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [reportId, setReportId] = useState("");
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const idFromUrl = searchParams.get("id");
  const scoreFromUrl = searchParams.get("score");

  // Agar URL mein score mojood hai (ya'ni direct Upload page se redirect hoke aaye hain)
  const hasFullUrlData = scoreFromUrl !== null;

  // URL data object fallback ke sath
  const urlData = {
    score: searchParams.get("score") || "0",
    verdict: searchParams.get("verdict") || "Pending",
    stroke: searchParams.get("stroke") || "-",
    slant: searchParams.get("slant") || "-",
    spacing: searchParams.get("spacing") || "-",
    justification:
      searchParams.get("justification") || "No explanation available.",
  };

  useEffect(() => {
    if (idFromUrl) {
      setReportId(idFromUrl.slice(-6).toUpperCase());
    } else {
      setReportId("A5A005");
    }

    // 🔄 CONDITION: Agar page history se khula hai (Sirf id hai, baaki details nahi hain)
    if (idFromUrl && !hasFullUrlData) {
      const fetchHistoryRecord = async () => {
        try {
          setLoading(true);
          setError("");

          // Humare naye GET route se data fetch karna
          const response = await fetch(`/api/compare?id=${idFromUrl}`);
          const json = await response.json();

          if (json.success && json.data) {
            const record = json.data;
            setApiData({
              score: record.similarityScore || "0",
              verdict: record.verdict || "N/A",
              stroke:
                record.metrics?.strokePathConsistency || record.stroke || "-",
              slant: record.metrics?.slantAngleMatching || record.slant || "-",
              spacing:
                record.metrics?.letterSpacingProportions ||
                record.spacing ||
                "-",
              justification:
                record.justification || "Analysis fetched from database.",
            });
          } else {
            setError("Database mein is ID ka koi record nahi mila.");
          }
        } catch (err) {
          console.error("Error loading history item:", err);
          setError("History se data load karne mein masla hua.");
        } finally {
          setLoading(false);
        }
      };

      fetchHistoryRecord();
    }
  }, [idFromUrl, hasFullUrlData]);

  // Upload ka direct data ho ya database se aaya data, is variable mein save hoga
  const finalData = hasFullUrlData ? urlData : apiData;
  const showCard = hasFullUrlData || apiData !== null;

  return (
    <div className='max-w-xl mx-auto p-6 space-y-8 animate-fade-in'>
      {/* 1. Header & Navigation */}
      <div className='flex items-center justify-between'>
        <button
          onClick={() => router.push("/upload")}
          className='inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-neutral-600 bg-white/60 hover:bg-white rounded-xl border border-neutral-200/50 shadow-sm transition-all hover:translate-x-[-2px]'>
          <span>←</span> New Analysis
        </button>

        <div className='text-right'>
          <span className='text-[10px] text-slate-400 uppercase tracking-widest font-bold'>
            Report ID
          </span>
          <p className='text-xs text-slate-500 font-mono'>#ANL-{reportId}</p>
        </div>
      </div>

      {/* 2. Main Area: Card, Loader ya Error Screen */}
      <div className='relative'>
        <div className='absolute -top-10 -left-10 w-40 h-40 bg-blue-100/40 rounded-full blur-3xl pointer-events-none'></div>

        {loading ? (
          <div className='flex flex-col items-center justify-center p-12 bg-white/50 backdrop-blur-sm rounded-[32px] border border-white space-y-3 shadow-md'>
            <div className='w-9 h-9 border-4 border-[#3b63b8]/20 border-t-[#3b63b8] rounded-full animate-spin'></div>
            <p className='text-slate-500 text-xs font-medium'>
              Loading History Record...
            </p>
          </div>
        ) : error ? (
          <div className='bg-rose-50 border border-rose-200 text-rose-800 p-6 rounded-[24px] shadow-sm text-center space-y-2'>
            <p className='font-bold text-base'>⚠️ Loading Error</p>
            <p className='text-xs text-rose-600/90 leading-relaxed max-w-sm mx-auto'>
              {error}
            </p>
          </div>
        ) : showCard ? (
          <ResultCard data={finalData} />
        ) : (
          <div className='bg-rose-50 border border-rose-200 text-rose-800 p-6 rounded-[24px] shadow-sm text-center space-y-2'>
            <p className='font-bold text-base'>⚠️ No Data Parameters Found</p>
            <p className='text-xs text-rose-600/90 leading-relaxed max-w-sm mx-auto'>
              Data load nahi ho saka. Kuch missing lag raha hai, dubara check
              karein.
            </p>
          </div>
        )}
      </div>

      {/* 3. Bottom Action Section (AI Chatbot Promo) */}
      <div className='bg-[#fcfbfa]/80 backdrop-blur-md border border-white p-6 rounded-[28px] shadow-lg text-center space-y-4'>
        <div className='inline-flex items-center justify-center w-10 h-10 bg-[#f4f0ea]/70 rounded-full mb-2'>
          <span className='text-lg'>🤖</span>
        </div>
        <h3 className='text-lg font-bold text-slate-800'>Need more details?</h3>
        <p className='text-sm text-slate-500 leading-relaxed'>
          Our AI Expert is ready to explain specific geometric markers or
          provide a deeper breakdown of this comparison.
        </p>

        <button
          className='w-full bg-[#3b63b8] text-white py-3 rounded-xl font-medium shadow-md hover:bg-[#2d4d91] transition-all'
          onClick={() => {
            /* Chatbot Logic */
          }}>
          Ask AI Expert
        </button>
      </div>
    </div>
  );
}

// ==========================================
// 🚀 EXPORT COMPONENT WITH NEXT.JS SUSPENSE
// ==========================================
export default function ResultsPage() {
  return (
    <div className='min-h-screen bg-[#f4f0ea]/30 py-10'>
      <Suspense
        fallback={
          <div className='flex flex-col items-center justify-center min-h-[60vh] space-y-4'>
            <div className='w-12 h-12 border-4 border-[#3b63b8]/20 border-t-[#3b63b8] rounded-full animate-spin'></div>
            <p className='text-slate-500 text-sm font-medium'>
              Generating Report...
            </p>
          </div>
        }>
        <ResultsContent />
      </Suspense>
    </div>
  );
}
