import Link from "next/link";

export default function Dashboard() {
  return (
    <div className='space-y-6 animate-fade-in max-w-7xl mx-auto px-4 py-6'>
      {/* Back to Home Link */}
      <div className='flex items-center'>
        <Link
          href='/'
          className='group flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors duration-200'>
          {/* SVG Arrow icon with sliding micro-interaction */}
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={2.5}
            stroke='currentColor'
            className='w-4 h-4 transform group-hover:-translate-x-1 transition-transform duration-200'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18'
            />
          </svg>
          Back to Home
        </Link>
      </div>

      {/* 1. Welcome Hero Banner: Matching the soft web texture */}
      <div className='bg-[#fcfbfa]/90 backdrop-blur-sm border border-white/60 p-8 rounded-[32px] shadow-xl relative overflow-hidden'>
        {/* Subtle decorative accent lines matching the paper aura */}
        <div className='absolute top-0 right-0 w-32 h-32 bg-blue-100/30 rounded-full blur-2xl -translate-y-10 translate-x-10 pointer-events-none'></div>
        <div className='absolute bottom-0 left-1/3 w-24 h-24 bg-amber-100/20 rounded-full blur-xl pointer-events-none'></div>

        <div className='relative z-10 space-y-2'>
          <div className='w-12 h-1 bg-amber-700/30 rounded-full mb-3'></div>
          <h1 className='text-3xl md:text-4xl font-bold tracking-tight text-[#3b63b8]'>
            Hi, Username!
          </h1>
          <p className='text-slate-600 max-w-xl text-sm md:text-base leading-relaxed'>
            Welcome to the Handwriting Matching System. Upload script samples to
            run AI analysis and check similarity scores instantly.
          </p>
        </div>
      </div>

      {/* 2. Action Bento Grid Layout */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Action Card 1: Compare New Scripts */}
        <div className='bg-[#fcfbfa]/90 backdrop-blur-sm border border-white/60 rounded-[28px] p-8 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.01] flex flex-col justify-between group'>
          <div>
            <div className='w-12 h-12 rounded-2xl bg-[#f4f0ea] flex items-center justify-center text-2xl mb-5 shadow-inner border border-white/40 group-hover:scale-110 transition-transform duration-300'>
              📄
            </div>
            <h3 className='text-xl font-bold text-slate-800 tracking-tight mb-2'>
              Compare New Scripts
            </h3>
            <p className='text-slate-500 text-sm leading-relaxed mb-6'>
              Upload two electronic or handwritten documents to calculate their
              geometric and contextual similarity.
            </p>
          </div>

          <Link
            href='/upload'
            className='w-full bg-[#4f6bf2] text-white text-center py-3 rounded-xl font-medium shadow-md shadow-blue-500/10 hover:bg-[#3f5ad2] transition-all duration-200 block'>
            Upload Samples
          </Link>
        </div>

        {/* Action Card 2: View Recent Reports */}
        <div className='bg-[#fcfbfa]/90 backdrop-blur-sm border border-white/60 rounded-[28px] p-8 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.01] flex flex-col justify-between group'>
          <div>
            <div className='w-12 h-12 rounded-2xl bg-[#f4f0ea] flex items-center justify-center text-2xl mb-5 shadow-inner border border-white/40 group-hover:scale-110 transition-transform duration-300'>
              📊
            </div>
            <h3 className='text-xl font-bold text-slate-800 tracking-tight mb-2'>
              View Recent Reports
            </h3>
            <p className='text-slate-500 text-sm leading-relaxed mb-6'>
              Access previous comparison logs, verification accuracy, and
              verification history reports.
            </p>
          </div>

          <Link
            href='/history'
            className='w-full bg-white text-slate-700 border border-neutral-200 text-center py-3 rounded-xl font-medium shadow-sm hover:bg-neutral-50 transition-all duration-200 block'>
            View Recent Results
          </Link>
        </div>
      </div>
    </div>
  );
}
