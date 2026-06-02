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
  const videoRef = useRef(null);

  const startCamera = async (docNum) => {
    setActiveDoc(docNum);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      setShowCamera(true);
      videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Camera access blocked!");
    }
  };

  const captureImage = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 600;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0, 600, 600);
    const data = canvas.toDataURL("image/jpeg");
    activeDoc === 1 ? setDoc1(data) : setDoc2(data);
    videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
    setShowCamera(false);
  };

  const handleRunAnalysis = async () => {
    setStep(3);
    try {
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ img1Url: doc1, img2Url: doc2 }),
      });
      const json = await res.json();
      if (json.success) {
        router.push(`/results?id=${json.data._id}`);
      } else {
        alert("Analysis failed.");
        setStep(1);
      }
    } catch (err) {
      alert("Network Error.");
      setStep(1);
    }
  };

  return (
    <div className='max-w-2xl mx-auto p-6 mt-10'>
      <div className='flex gap-2 mb-10'>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full ${step >= i ? "bg-blue-500" : "bg-slate-200"}`}
          />
        ))}
      </div>

      <div className='bg-white/40 backdrop-blur-3xl border border-white/60 p-10 rounded-[48px] shadow-2xl min-h-[500px]'>
        {showCamera ? (
          <div className='space-y-4 animate-in fade-in'>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className='rounded-3xl w-full bg-slate-900 aspect-square object-cover'
            />
            <button
              onClick={captureImage}
              className='w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700'>
              Capture Document
            </button>
          </div>
        ) : (
          step < 3 && (
            <div className='space-y-8 animate-in fade-in'>
              <h2 className='text-3xl font-black text-slate-800 text-center'>
                {step === 1
                  ? "Step 1: Baseline Sample"
                  : "Step 2: Comparison Target"}
              </h2>

              <div className='grid grid-cols-2 gap-4'>
                <div className='text-center space-y-2'>
                  <p className='text-[10px] font-bold text-slate-400 uppercase'>
                    Baseline
                  </p>
                  <div className='aspect-square bg-slate-100 rounded-3xl border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden'>
                    {doc1 ? (
                      <img src={doc1} className='w-full h-full object-cover' />
                    ) : (
                      <span className='text-slate-300'>Empty</span>
                    )}
                  </div>
                </div>
                <div className='text-center space-y-2'>
                  <p className='text-[10px] font-bold text-slate-400 uppercase'>
                    Target
                  </p>
                  <div className='aspect-square bg-slate-100 rounded-3xl border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden'>
                    {doc2 ? (
                      <img src={doc2} className='w-full h-full object-cover' />
                    ) : (
                      <span className='text-slate-300'>Empty</span>
                    )}
                  </div>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <label className='bg-white py-4 rounded-2xl border border-slate-200 flex flex-col items-center cursor-pointer hover:shadow-lg transition-all'>
                  <span className='text-xl'>📁</span>
                  <span className='text-xs font-bold text-slate-600'>
                    Upload File
                  </span>
                  <input
                    type='file'
                    className='hidden'
                    onChange={(e) => {
                      const reader = new FileReader();
                      reader.onload = (ev) =>
                        step === 1
                          ? setDoc1(ev.target.result)
                          : setDoc2(ev.target.result);
                      reader.readAsDataURL(e.target.files[0]);
                    }}
                  />
                </label>
                <button
                  onClick={() => startCamera(step)}
                  className='bg-white py-4 rounded-2xl border border-slate-200 flex flex-col items-center hover:shadow-lg transition-all'>
                  <span className='text-xl'>📸</span>
                  <span className='text-xs font-bold text-slate-600'>
                    Use Camera
                  </span>
                </button>
              </div>

              <button
                onClick={() => (step === 1 ? setStep(2) : handleRunAnalysis())}
                disabled={step === 1 ? !doc1 : !doc2}
                className='w-full py-5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-blue-600 transition-all disabled:opacity-50'>
                {step === 1 ? "Continue to Step 2" : "Execute AI Analysis"}
              </button>
            </div>
          )
        )}

        {step === 3 && (
          <div className='py-20 text-center space-y-4'>
            <div className='w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto' />
            <p className='font-bold text-slate-700'>
              Handwrittens Processing...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
