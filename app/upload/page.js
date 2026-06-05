"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [doc1, setDoc1] = useState(null);
  const [doc2, setDoc2] = useState(null);

  const [showCamera, setShowCamera] = useState(false);
  const [activeDoc, setActiveDoc] = useState(1);
  const [loading, setLoading] = useState(false);

  const videoRef = useRef(null);

  // =========================
  // IMAGE COMPRESSOR (IMPORTANT)
  // =========================
  const compressImage = (base64, quality = 0.6) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const size = 600;

        canvas.width = size;
        canvas.height = size;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, size, size);

        const compressed = canvas.toDataURL("image/jpeg", quality);
        resolve(compressed);
      };
    });
  };

  // =========================
  // CAMERA START
  // =========================
  const startCamera = async (docNum) => {
    setActiveDoc(docNum);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      setShowCamera(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert("Camera access denied!");
    }
  };

  // =========================
  // CAPTURE IMAGE (MOBILE SAFE)
  // =========================
  const captureImage = async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 600;

    const ctx = canvas.getContext("2d");

    ctx.drawImage(videoRef.current, 0, 0, 600, 600);

    let image = canvas.toDataURL("image/jpeg", 0.7);

    // 🔥 compress again (fix mobile network error)
    image = await compressImage(image, 0.5);

    if (activeDoc === 1) setDoc1(image);
    else setDoc2(image);

    // stop camera stream
    const stream = videoRef.current?.srcObject;
    if (stream) stream.getTracks().forEach((t) => t.stop());

    setShowCamera(false);
  };

  // =========================
  // RUN ANALYSIS
  // =========================
  const handleRunAnalysis = async () => {
    setLoading(true);

    try {
      // safety check (VERY IMPORTANT)
      if (!doc1 || !doc2) {
        alert("Please upload both documents");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          img1Url: doc1,
          img2Url: doc2,
        }),
      });

      const json = await res.json();

      if (json.success && json.data?._id) {
        router.push(`/results?id=${json.data._id}`);
      } else {
        alert(json.error || "Analysis failed");
        setStep(1);
      }
    } catch (err) {
      console.error(err);
      alert("Network Error (Try again)");
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <div className='max-w-2xl mx-auto p-6 mt-10'>
      {/* STEP BAR */}
      <div className='flex gap-2 mb-10'>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full ${
              step >= i ? "bg-blue-500" : "bg-slate-200"
            }`}
          />
        ))}
      </div>

      <div className='bg-white/40 backdrop-blur-3xl border p-10 rounded-[48px] shadow-2xl min-h-[500px]'>
        {/* CAMERA VIEW */}
        {showCamera ? (
          <div className='space-y-4'>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className='w-full aspect-square object-cover bg-black rounded-3xl'
            />

            <button
              onClick={captureImage}
              className='w-full py-4 bg-blue-600 text-white rounded-2xl font-bold'>
              Capture Document
            </button>
          </div>
        ) : (
          step < 3 && (
            <div className='space-y-8'>
              {/* TITLE */}
              <h2 className='text-3xl font-black text-center'>
                {step === 1
                  ? "Step 1: Baseline Sample"
                  : "Step 2: Comparison Target"}
              </h2>

              {/* PREVIEW */}
              <div className='grid grid-cols-2 gap-4'>
                <div className='text-center space-y-2'>
                  <p className='text-xs font-bold uppercase'>Baseline</p>
                  <div className='aspect-square bg-slate-100 rounded-3xl overflow-hidden flex items-center justify-center'>
                    {doc1 ? (
                      <img src={doc1} className='w-full h-full object-cover' />
                    ) : (
                      <span className='text-slate-300'>Empty</span>
                    )}
                  </div>
                </div>

                <div className='text-center space-y-2'>
                  <p className='text-xs font-bold uppercase'>Target</p>
                  <div className='aspect-square bg-slate-100 rounded-3xl overflow-hidden flex items-center justify-center'>
                    {doc2 ? (
                      <img src={doc2} className='w-full h-full object-cover' />
                    ) : (
                      <span className='text-slate-300'>Empty</span>
                    )}
                  </div>
                </div>
              </div>

              {/* ACTIONS */}
              <div className='grid grid-cols-2 gap-4'>
                {/* FILE UPLOAD */}
                <label className='bg-white py-4 rounded-2xl border flex flex-col items-center cursor-pointer'>
                  📁
                  <span className='text-xs font-bold'>Upload</span>
                  <input
                    type='file'
                    className='hidden'
                    accept='image/*'
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        if (step === 1) setDoc1(ev.target.result);
                        else setDoc2(ev.target.result);
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>

                {/* CAMERA */}
                <button
                  onClick={() => startCamera(step)}
                  className='bg-white py-4 rounded-2xl border flex flex-col items-center'>
                  📸
                  <span className='text-xs font-bold'>Camera</span>
                </button>
              </div>

              {/* NEXT BUTTON */}
              <button
                disabled={step === 1 ? !doc1 : !doc2 || loading}
                onClick={() => (step === 1 ? setStep(2) : handleRunAnalysis())}
                className='w-full py-5 bg-slate-900 text-white rounded-2xl font-bold disabled:opacity-50'>
                {loading
                  ? "Processing..."
                  : step === 1
                    ? "Continue"
                    : "Run AI Analysis"}
              </button>
            </div>
          )
        )}

        {/* LOADING SCREEN */}
        {loading && step === 3 && (
          <div className='py-20 text-center'>
            <div className='w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto' />
            <p className='mt-4 font-bold'>Processing Handwriting Analysis...</p>
          </div>
        )}
      </div>
    </div>
  );
}
