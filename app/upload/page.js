"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [doc1, setDoc1] = useState(null);
  const [doc2, setDoc2] = useState(null);

  const [showCamera, setShowCamera] = useState(false);
  const [activeDoc, setActiveDoc] = useState(1);
  const [loading, setLoading] = useState(false);
  const [processingImage, setProcessingImage] = useState(false);

  const videoRef = useRef(null);
  const cameraStreamRef = useRef(null);

  const stopCamera = () => {
    try {
      const stream =
        cameraStreamRef.current || videoRef.current?.srcObject || null;

      if (stream && typeof stream.getTracks === "function") {
        stream.getTracks().forEach((track) => track.stop());
      }

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      cameraStreamRef.current = null;
      setShowCamera(false);
    } catch (err) {
      console.error("stopCamera error:", err);
      setShowCamera(false);
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  useEffect(() => {
    if (!showCamera) return;

    const attach = () => {
      if (videoRef.current && cameraStreamRef.current) {
        videoRef.current.srcObject = cameraStreamRef.current;
        videoRef.current.play().catch(() => {});
      }
    };

    const id = requestAnimationFrame(attach);
    return () => cancelAnimationFrame(id);
  }, [showCamera]);

  const compressImageSource = (
    source,
    {
      maxWidth = 1024,
      maxHeight = 1024,
      quality = 0.72,
      mimeType = "image/jpeg",
    } = {},
  ) => {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        try {
          const width = img.naturalWidth || img.width;
          const height = img.naturalHeight || img.height;

          const scale = Math.min(maxWidth / width, maxHeight / height, 1);
          const targetWidth = Math.max(1, Math.round(width * scale));
          const targetHeight = Math.max(1, Math.round(height * scale));

          const canvas = document.createElement("canvas");
          canvas.width = targetWidth;
          canvas.height = targetHeight;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Canvas not available"));
            return;
          }

          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

          const output = canvas.toDataURL(mimeType, quality);
          resolve(output);
        } catch (err) {
          reject(err);
        }
      };

      img.onerror = () => reject(new Error("Could not process image"));
      img.src = source;
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";

    if (!file) return;

    try {
      setProcessingImage(true);

      const reader = new FileReader();

      reader.onload = async (ev) => {
        try {
          const raw = ev.target?.result;
          if (typeof raw !== "string") {
            throw new Error("Invalid image file");
          }

          const compressed = await compressImageSource(raw, {
            maxWidth: 1024,
            maxHeight: 1024,
            quality: 0.72,
          });

          if (step === 1) setDoc1(compressed);
          else setDoc2(compressed);
        } catch (err) {
          console.error(err);
          alert(err.message || "Image processing failed");
        } finally {
          setProcessingImage(false);
        }
      };

      reader.onerror = () => {
        setProcessingImage(false);
        alert("File read failed");
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setProcessingImage(false);
      alert("Image upload failed");
    }
  };

  // =========================
  // CAMERA START
  // =========================
  const startCamera = async (docNum) => {
    setActiveDoc(docNum);

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        alert("Camera is not supported on this device/browser");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
        },
        audio: false,
      });

      cameraStreamRef.current = stream;
      setShowCamera(true);
    } catch (err) {
      console.error("Camera error:", err);
      alert("Camera access denied or unavailable!");
    }
  };

  // =========================
  // CAPTURE IMAGE
  // =========================
  const captureImage = async () => {
    try {
      const video = videoRef.current;
      if (!video) {
        alert("Camera not ready");
        return;
      }

      const vw = video.videoWidth || 1280;
      const vh = video.videoHeight || 720;

      const maxSide = 1024;
      const scale = Math.min(maxSide / vw, maxSide / vh, 1);
      const canvasWidth = Math.max(1, Math.round(vw * scale));
      const canvasHeight = Math.max(1, Math.round(vh * scale));

      const canvas = document.createElement("canvas");
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        alert("Canvas not supported");
        return;
      }

      ctx.drawImage(video, 0, 0, canvasWidth, canvasHeight);

      const rawImage = canvas.toDataURL("image/jpeg", 0.85);

      const compressed = await compressImageSource(rawImage, {
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 0.72,
      });

      if (activeDoc === 1) setDoc1(compressed);
      else setDoc2(compressed);

      stopCamera();
    } catch (err) {
      console.error("captureImage error:", err);
      alert("Could not capture image");
    }
  };

  // =========================
  // RUN ANALYSIS
  // =========================
  const handleRunAnalysis = async () => {
    if (!doc1 || !doc2) {
      alert("Please upload both documents");
      return;
    }

    setLoading(true);
    setStep(3);

    try {
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          img1Url: doc1,
          img2Url: doc2,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(json.error || "Network Error");
      }

      if (json.success && json.data?._id) {
        router.push(`/results?id=${json.data._id}`);
        return;
      }

      throw new Error(json.error || "Analysis failed");
    } catch (err) {
      console.error(err);
      alert(err.message || "Network Error (Try again)");
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='max-w-2xl mx-auto p-6 mt-10'>
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
        {showCamera ? (
          <div className='space-y-4'>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className='w-full aspect-square object-cover bg-black rounded-3xl'
            />

            <div className='grid grid-cols-2 gap-3'>
              <button
                onClick={captureImage}
                className='w-full py-4 bg-blue-600 text-white rounded-2xl font-bold'>
                Capture Document
              </button>

              <button
                onClick={stopCamera}
                className='w-full py-4 bg-slate-200 text-slate-900 rounded-2xl font-bold'>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          step < 3 && (
            <div className='space-y-8'>
              <h2 className='text-3xl font-black text-center'>
                {step === 1
                  ? "Step 1: Baseline Sample"
                  : "Step 2: Comparison Target"}
              </h2>

              <div className='grid grid-cols-2 gap-4'>
                <div className='text-center space-y-2'>
                  <p className='text-xs font-bold uppercase'>Baseline</p>
                  <div className='aspect-square bg-slate-100 rounded-3xl overflow-hidden flex items-center justify-center'>
                    {doc1 ? (
                      <img
                        src={doc1}
                        alt='Baseline'
                        className='w-full h-full object-cover'
                      />
                    ) : (
                      <span className='text-slate-300'>Empty</span>
                    )}
                  </div>
                </div>

                <div className='text-center space-y-2'>
                  <p className='text-xs font-bold uppercase'>Target</p>
                  <div className='aspect-square bg-slate-100 rounded-3xl overflow-hidden flex items-center justify-center'>
                    {doc2 ? (
                      <img
                        src={doc2}
                        alt='Target'
                        className='w-full h-full object-cover'
                      />
                    ) : (
                      <span className='text-slate-300'>Empty</span>
                    )}
                  </div>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <label className='bg-white py-4 rounded-2xl border flex flex-col items-center cursor-pointer'>
                  📁
                  <span className='text-xs font-bold'>
                    {processingImage ? "Optimizing..." : "Upload"}
                  </span>
                  <input
                    type='file'
                    className='hidden'
                    accept='image/*'
                    onChange={handleFileChange}
                    disabled={processingImage || loading}
                  />
                </label>

                <button
                  onClick={() => startCamera(step)}
                  className='bg-white py-4 rounded-2xl border flex flex-col items-center'
                  disabled={processingImage || loading}>
                  📸
                  <span className='text-xs font-bold'>Camera</span>
                </button>
              </div>

              <button
                disabled={
                  (step === 1 ? !doc1 : !doc2) || loading || processingImage
                }
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
