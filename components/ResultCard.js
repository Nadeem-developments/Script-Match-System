export default function ResultCard({ data }) {
  if (!data) return null;

  return (
    // Card Container: Aesthetic cream background with soft border and shadow
    <div className='bg-[#fcfbfa]/90 backdrop-blur-sm border border-white/60 rounded-[32px] shadow-2xl p-8 space-y-8 max-w-md mx-auto transition-all hover:scale-[1.01]'>
      {/* Header with Custom Blue Theme */}
      <div className='text-center space-y-1'>
        <h1 className='text-3xl font-bold tracking-tight text-[#3b63b8]'>
          Analysis Result
        </h1>
        <div className='w-12 h-1 bg-amber-700/30 mx-auto rounded-full'></div>
      </div>

      {/* Main Score Section: Soft Inner Shadow & Gradient Text */}
      <div className='bg-[#f4f0ea] border border-white/40 p-8 rounded-[24px] flex flex-col items-center justify-center shadow-inner'>
        <div className='text-7xl font-black text-[#3b63b8] drop-shadow-sm'>
          {data.score}%
        </div>
        <div className='mt-2 px-4 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-semibold border border-emerald-100'>
          {data.verdict}
        </div>
      </div>

      {/* Justification Box: Glass effect with subtle blue tint */}
      <div className='bg-blue-50/40 p-5 rounded-2xl border border-blue-100/50 relative overflow-hidden'>
        {/* Subtle decorative accent */}
        <div className='absolute top-0 left-0 w-1 h-full bg-[#4f6bf2]/40'></div>

        <h3 className='font-bold text-[#3b63b8] text-xs uppercase tracking-wider mb-2'>
          AI Expert Justification
        </h3>
        <p className='text-slate-600 text-sm leading-relaxed'>
          {data.justification || "No justification available."}
        </p>
      </div>

      {/* Stats Grid: Soft Bento-style boxes */}
      <div className='grid grid-cols-3 gap-4'>
        {[
          { label: "Stroke", value: data.stroke },
          { label: "Slant", value: data.slant },
          { label: "Spacing", value: data.spacing },
        ].map((m) => (
          <div
            key={m.label}
            className='bg-white/60 p-4 rounded-2xl text-center border border-white shadow-sm transition-hover hover:bg-white'>
            <p className='text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1'>
              {m.label}
            </p>
            <p className='font-bold text-slate-800 text-sm'>{m.value || "-"}</p>
          </div>
        ))}
      </div>

      {/* Footer Branding (Optional but adds aesthetic touch) */}
      <div className='pt-4 text-center'>
        <span className='text-[10px] text-slate-400 uppercase tracking-[0.2em] font-medium'>
          Verified by AI Engine
        </span>
      </div>
    </div>
  );
}
