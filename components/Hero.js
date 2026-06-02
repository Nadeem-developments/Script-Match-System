import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className='w-full max-w-7xl mx-auto px-4 py-8 md:py-16 grid grid-cols-1 md:grid-cols-12 gap-8 items-center min-h-[calc(100vh-120px)] overflow-hidden'>
      {/* Left Column: Scattered Papers/Documents Visual Layout */}
      <div className='col-span-1 md:col-span-6 relative h-[350px] md:h-[500px] flex items-center justify-center'>
        {/* Background / Decorative Scattered Sheets */}
        <div className='absolute w-44 h-56 bg-white shadow-md border border-neutral-200 p-4 transform -rotate-12 -translate-x-16 -translate-y-12 rounded-sm hidden sm:block opacity-80'>
          <div className='w-full h-3 bg-neutral-200 rounded mb-2'></div>
          <div className='w-5/6 h-2 bg-neutral-100 rounded mb-2'></div>
          <div className='w-4/5 h-2 bg-neutral-100 rounded'></div>
        </div>

        <div className='absolute w-40 h-52 bg-blue-50/40 border border-blue-200 p-3 transform rotate-45 translate-x-24 -translate-y-24 rounded-sm shadow-sm hidden sm:block'>
          <div className='w-full h-full border border-dashed border-blue-300 flex items-center justify-center text-xs text-blue-400'>
            Blueprint
          </div>
        </div>

        {/* Main Center Document (Focused Sheet) */}
        <div className='absolute w-52 h-72 bg-[#fcfbfa] shadow-xl border border-neutral-200/70 p-5 transform rotate-6 z-10 rounded-sm flex flex-col justify-between'>
          <div>
            <div className='w-12 h-1 bg-amber-700/30 rounded mb-4'></div>
            <p className='text-[10px] text-neutral-400 leading-relaxed font-serif'>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam...
            </p>
          </div>
          <div className='flex justify-end'>
            <div className='w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 text-xs'>
              📄
            </div>
          </div>
        </div>

        {/* Another Floating Smaller Note */}
        <div className='absolute w-36 h-44 bg-white shadow-lg border border-neutral-200 p-3 transform -rotate-6 translate-x-20 translate-y-24 z-20 rounded-sm'>
          <div className='w-full h-2 bg-neutral-200 rounded mb-2'></div>
          <div className='w-3/4 h-2 bg-neutral-100 rounded'></div>
        </div>
      </div>

      {/* Right Column: Text and CTA Button */}
      <div className='col-span-1 md:col-span-6 flex flex-col justify-center text-center md:text-left pl-0 md:pl-8 z-30'>
        <h1 className='text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#3b63b8] leading-[1.15] mb-6'>
          Manage Your <br className='hidden md:block' />
          Documents with Ease
        </h1>

        <div className='mt-2'>
          {/* Sahi aur Modern approach Next.js 13/14/15+ ke liye */}
          <Button
            asChild
            className='bg-[#4f6bf2] hover:bg-[#3f5ad2] text-white px-8 py-6 rounded-2xl text-lg font-medium shadow-lg shadow-blue-500/20 transition-all duration-200 hover:scale-[1.02] cursor-pointer'>
            <Link href='/dashboard'>Get Started</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
