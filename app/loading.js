export default function Loading() {
  return (
    <div className='flex flex-col items-center justify-center min-h-[60vh]'>
      <div className='w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin'></div>
      <p className='mt-4 text-slate-500 font-medium'>Loading Vault...</p>
    </div>
  );
}
