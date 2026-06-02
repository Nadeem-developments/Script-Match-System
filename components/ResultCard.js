export default function ResultCard({ data, onDelete, id }) {
  if (!data) return null;

  const badge =
    data.verdict === "Strong Match"
      ? "bg-green-100 text-green-700"
      : data.verdict === "Probable Match"
        ? "bg-blue-100 text-blue-700"
        : data.verdict === "Inconclusive"
          ? "bg-yellow-100 text-yellow-700"
          : "bg-red-100 text-red-700";

  return (
    <div className='w-full max-w-lg mx-auto bg-white/40 backdrop-blur-2xl border border-white/50 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.08)] p-8'>
      <div className='text-center mb-8'>
        <span className='px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[#3b63b8] text-[10px] font-bold uppercase tracking-[0.2em]'>
          Verified AI Report
        </span>

        <h1 className='text-3xl font-extrabold text-slate-800 mt-3'>
          Analysis Result
        </h1>
      </div>

      <div className='flex flex-col items-center mb-6'>
        <div className='w-40 h-40 rounded-full border-[6px] border-blue-50 flex flex-col items-center justify-center'>
          <span className='text-5xl font-black text-slate-800'>
            {data.score}%
          </span>
          <span className='text-[10px] text-slate-400 font-bold uppercase'>
            Similarity
          </span>
        </div>

        <div className='mt-4'>
          <span className={`px-4 py-2 rounded-full text-xs font-bold ${badge}`}>
            {data.verdict}
          </span>
        </div>
      </div>

      <div className='bg-blue-900/5 p-6 rounded-[32px] mb-8 border border-blue-900/10'>
        <h3 className='font-bold text-slate-800 mb-2'>Examiner Observation</h3>

        <p className='text-slate-600 text-sm leading-relaxed'>
          {data.justification}
        </p>
      </div>

      <div className='grid grid-cols-3 gap-3 mb-6'>
        <div className='bg-white/60 p-4 rounded-3xl border text-center'>
          <p className='text-[9px] font-extrabold text-slate-400 uppercase'>
            Stroke
          </p>
          <p className='font-bold text-slate-700 text-[11px] mt-1'>
            {data.stroke ?? "0%"}
          </p>
        </div>

        <div className='bg-white/60 p-4 rounded-3xl border text-center'>
          <p className='text-[9px] font-extrabold text-slate-400 uppercase'>
            HOG
          </p>
          <p className='font-bold text-slate-700 text-[11px] mt-1'>
            {data.slant ?? "0%"}
          </p>
        </div>

        <div className='bg-white/60 p-4 rounded-3xl border text-center'>
          <p className='text-[9px] font-extrabold text-slate-400 uppercase'>
            Structure
          </p>
          <p className='font-bold text-slate-700 text-[11px] mt-1'>
            {data.spacing ?? "0%"}
          </p>
        </div>
      </div>

      <button
        onClick={() => onDelete(id)}
        className='w-full py-3 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-2xl'>
        Delete Report
      </button>
    </div>
  );
}
``;
