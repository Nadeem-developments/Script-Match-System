"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [doc1Base64, setDoc1Base64] = useState("");
  const [doc2Base64, setDoc2Base64] = useState("");
  const [loadingText, setLoadingText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e, setBase64) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = 400;
          canvas.height = 400;
          if (ctx) ctx.drawImage(img, 0, 0, 400, 400);
          const compressedData = canvas.toDataURL("image/jpeg", 0.5);
          setBase64(compressedData);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRunAnalysis = async () => {
    setIsProcessing(true);
    setStep(3);
    setLoadingText("Initializing Preprocessing & Noise Reduction Filters...");

    try {
      const response = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ img1Url: doc1Base64, img2Url: doc2Base64 }),
      });

      const jsonResult = await response.json();

      if (jsonResult.success) {
        // Safe check: Agar record 'data' ke andar hai ya direct root par hai
        const record = jsonResult.data || jsonResult;
        const mongoId = jsonResult.id || "";

        // Params taiyar karna standard URL parameters ke sath
        const score = record.similarityScore || jsonResult.similarityScore || 0;
        const verdict = record.verdict || jsonResult.verdict || "N/A";

        // Metrics structural fallbacks
        const stroke =
          record.metrics?.strokePathConsistency ||
          jsonResult.metrics?.strokePathConsistency ||
          "-";
        const slant =
          record.metrics?.slantAngleMatching ||
          jsonResult.metrics?.slantAngleMatching ||
          "-";
        const spacing =
          record.metrics?.letterSpacingProportions ||
          jsonResult.metrics?.letterSpacingProportions ||
          "-";
        const justification =
          record.justification ||
          jsonResult.justification ||
          "Analysis completed successfully.";

        // URL structure building smoothly
        router.push(
          `/results?id=${mongoId}&score=${score}&verdict=${encodeURIComponent(verdict)}&stroke=${encodeURIComponent(stroke)}&slant=${encodeURIComponent(slant)}&spacing=${encodeURIComponent(spacing)}&justification=${encodeURIComponent(justification)}`,
        );
      } else {
        alert(`Upload Rejected: ${jsonResult.error || "Data fault."}`);
        setStep(1);
      }
    } catch (err) {
      console.error(err);
      alert("Network transport layer route failed.");
      setStep(1);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className='max-w-xl mx-auto p-4 md:p-0 mt-8 relative'>
      {/* Navigation Controls */}
      {step === 1 && (
        <button
          onClick={() => router.push("/dashboard")}
          className='absolute left-2 md:-left-14 top-1.5 flex items-center justify-center w-9 h-9 rounded-full bg-white border border-slate-200 shadow-sm text-slate-600 hover:text-slate-900 transition-all z-20'
          title='Back to Dashboard'>
          ←
        </button>
      )}

      {step === 2 && (
        <button
          onClick={() => setStep(1)}
          className='absolute left-2 md:-left-14 top-1.5 flex items-center justify-center w-9 h-9 rounded-full bg-white border border-slate-200 shadow-sm text-slate-600 hover:text-slate-900 transition-all z-20'
          title='Back to Step 1'>
          ←
        </button>
      )}

      {/* Step Indicator Bullets */}
      <div className='flex items-center justify-center gap-2 mb-6'>
        <div
          className={`h-1.5 rounded-full transition-all duration-300 ${step === 1 ? "w-8 bg-[#4f6bf2]" : "w-2 bg-slate-300"}`}
        />
        <div
          className={`h-1.5 rounded-full transition-all duration-300 ${step === 2 ? "w-8 bg-[#4f6bf2]" : "w-2 bg-slate-300"}`}
        />
        <div
          className={`h-1.5 rounded-full transition-all duration-300 ${step === 3 ? "w-8 bg-[#4f6bf2]" : "w-2 bg-slate-300"}`}
        />
      </div>

      {/* Main Container Card */}
      <div className='bg-[#fcfbfa]/90 backdrop-blur-sm border border-white/60 rounded-[32px] shadow-2xl p-8 space-y-6 min-h-[460px] flex flex-col justify-center relative overflow-hidden'>
        <div className='absolute top-0 left-0 w-32 h-32 bg-blue-100/30 rounded-full blur-2xl pointer-events-none -translate-x-10 -translate-y-10' />

        {/* STEP 1: DOCUMENT 1 */}
        {step === 1 && (
          <div className='space-y-6 text-center flex flex-col flex-1 justify-between'>
            {doc1Base64 ? (
              <div className='space-y-4 flex-1 flex flex-col items-center justify-center py-4'>
                <div className='w-full max-h-[220px] rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-white flex items-center justify-center'>
                  <img
                    src={doc1Base64}
                    alt='Document 1'
                    className='w-full h-full object-contain p-2'
                  />
                </div>
                <div className='space-y-1'>
                  <h3 className='text-lg font-bold text-emerald-700 tracking-tight flex items-center justify-center gap-1.5'>
                    ✨ Document 1 Loaded
                  </h3>
                </div>
              </div>
            ) : (
              <div className='space-y-6 flex-1 flex flex-col justify-between'>
                <div className='space-y-2'>
                  <h2 className='text-2xl font-bold tracking-tight text-[#3b63b8]'>
                    Upload Document 1
                  </h2>
                  <p className='text-xs text-slate-400'>
                    Please supply the initial baseline handwriting sample
                  </p>
                </div>

                <div className='border-2 border-dashed rounded-2xl p-10 bg-[#f4f0ea]/50 relative transition-all flex flex-col items-center justify-center gap-3 group border-slate-300/80 hover:border-[#4f6bf2] hover:bg-white min-h-[180px]'>
                  <input
                    type='file'
                    accept='image/*'
                    className='absolute inset-0 opacity-0 cursor-pointer z-10'
                    onChange={(e) => handleFileChange(e, setDoc1Base64)}
                  />
                  <div className='w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm border border-white bg-white group-hover:scale-110 transition-transform'>
                    📁
                  </div>
                  <p className='text-sm font-semibold tracking-tight text-slate-600'>
                    Select First Handwriting Sample
                  </p>
                </div>
              </div>
            )}

            <button
              disabled={!doc1Base64}
              onClick={() => setStep(2)}
              className='w-full bg-[#4f6bf2] hover:bg-[#3f5ad2] text-white py-3.5 rounded-xl font-medium transition-all'>
              Continue to Document 2
            </button>
          </div>
        )}

        {/* STEP 2: DOCUMENT 2 */}
        {step === 2 && (
          <div className='space-y-6 text-center flex flex-col flex-1 justify-between'>
            {doc2Base64 ? (
              <div className='space-y-4 flex-1 flex flex-col items-center justify-center py-4'>
                <div className='grid grid-cols-2 gap-4 w-full'>
                  <div className='w-full h-28 rounded-xl overflow-hidden border bg-slate-50 flex items-center justify-center'>
                    <img
                      src={doc1Base64}
                      alt='Doc 1'
                      className='w-full h-full object-contain p-1 opacity-80'
                    />
                  </div>
                  <div className='w-full h-28 rounded-xl overflow-hidden border border-emerald-200 bg-white flex items-center justify-center'>
                    <img
                      src={doc2Base64}
                      alt='Doc 2'
                      className='w-full h-full object-contain p-1'
                    />
                  </div>
                </div>
                <h3 className='text-lg font-bold text-emerald-700 tracking-tight'>
                  ✨ Document 2 Loaded
                </h3>
              </div>
            ) : (
              <div className='space-y-6 flex-1 flex flex-col justify-between'>
                <div className='space-y-2'>
                  <h2 className='text-2xl font-bold tracking-tight text-[#3b63b8]'>
                    Upload Document 2
                  </h2>
                  <p className='text-xs text-slate-400'>
                    Supply the comparison target sheet
                  </p>
                </div>

                <div className='border-2 border-dashed rounded-2xl p-10 bg-[#f4f0ea]/50 relative transition-all flex flex-col items-center justify-center gap-3 group border-slate-300/80 hover:border-[#4f6bf2] hover:bg-white min-h-[180px]'>
                  <input
                    type='file'
                    accept='image/*'
                    className='absolute inset-0 opacity-0 cursor-pointer z-10'
                    onChange={(e) => handleFileChange(e, setDoc2Base64)}
                  />
                  <div className='w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm border border-white bg-white group-hover:scale-110 transition-transform'>
                    📁
                  </div>
                  <p className='text-sm font-semibold tracking-tight text-slate-600'>
                    Select Second Reference Sample
                  </p>
                </div>
              </div>
            )}

            <div className='flex gap-4'>
              <button
                onClick={() => setStep(1)}
                className='w-1/3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 py-3.5 rounded-xl font-medium transition-all'>
                Back
              </button>
              <button
                disabled={!doc2Base64 || isProcessing}
                onClick={handleRunAnalysis}
                className='flex-1 bg-[#4f6bf2] hover:bg-[#3f5ad2] text-white py-3.5 rounded-xl font-medium transition-all'>
                Execute Matrix Engine
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: LOADING SCREEN */}
        {step === 3 && (
          <div className='py-12 text-center space-y-6 flex flex-col items-center justify-center flex-1'>
            <div className='animate-spin rounded-full h-16 w-16 border-4 border-[#4f6bf2]/20 border-t-[#4f6bf2]' />
            <h3 className='text-lg font-bold text-slate-800 tracking-tight'>
              Analyzing Geometric Data
            </h3>
          </div>
        )}
      </div>
    </div>
  );
}
