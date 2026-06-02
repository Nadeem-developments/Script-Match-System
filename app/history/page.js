import dbConnect from "@/lib/db";
import Comparison from "@/models/Comparison";
import { auth } from "@clerk/nextjs/server"; // ✅ Clerk's cloud session handler
import Link from "next/link";

async function getHistory() {
  try {
    // Clerk se direct securely logged-in user ki unique cloud ID nikalein
    const { userId } = await auth();

    if (!userId) return null; // Agar user logged-in nahi hai

    await dbConnect();

    // Database se sirf is particular verified userId ke scans lana
    return await Comparison.find({ userId: userId }).sort({ createdAt: -1 });
  } catch (error) {
    console.error("CLERK_DATABASE_HISTORY_ERROR:", error);
    return [];
  }
}

export default async function HistoryPage() {
  const items = await getHistory();

  // 1. User logged in nahi hai (Secure Redirect state)
  if (items === null) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[60vh] space-y-4'>
        <div className='p-4 bg-amber-50 border border-amber-100 text-amber-700 rounded-2xl text-sm font-medium'>
          🔒 Cloud Access Error: Please sign in with an online account to view
          history.
        </div>
        <Link
          href='/sign-in'
          className='bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-medium shadow-lg transition-colors'>
          Sign In / Sign Up
        </Link>
      </div>
    );
  }

  // 2. User logged in hai par koi scan records nahi hain
  if (items.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[60vh] text-center px-4'>
        <h2 className='text-xl font-semibold text-slate-400'>
          No Analysis Found
        </h2>
        <p className='text-slate-500 mt-2 mb-6 text-sm max-w-sm'>
          Aapke secure cloud profile par abhi tak koi scanned matching documents
          majood nahi hain.
        </p>
        <Link
          href='/upload'
          className='border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-2 rounded-full font-medium transition-colors'>
          Start First Verification
        </Link>
      </div>
    );
  }

  // 3. Render items successfully
  return (
    <div className='w-full max-w-5xl mx-auto space-y-8 p-6'>
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6'>
        <div>
          <h1 className='text-3xl font-bold text-blue-600 tracking-tight'>
            Cloud Secure History
          </h1>
          <p className='text-slate-500 text-sm mt-1'>
            Reviewing your past handwriting verification logs.
          </p>
        </div>
        <div className='bg-white px-4 py-2 rounded-2xl border shadow-sm inline-flex items-center gap-2 self-start md:self-center'>
          <span className='h-2 w-2 bg-green-500 rounded-full animate-pulse'></span>
          <span className='text-xs font-bold text-slate-600 uppercase'>
            {items.length} Scans Secured
          </span>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
        {items.map((log) => (
          <div
            key={log._id.toString()}
            className='group bg-white border border-slate-100 p-6 rounded-[32px] shadow-sm hover:shadow-xl transition-all duration-300'>
            <div className='flex items-center justify-between mb-4'>
              <span
                className={`text-xs px-3 py-1 rounded-full font-bold border ${
                  log.similarityScore > 75
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                    : "bg-rose-50 text-rose-600 border-rose-100"
                }`}>
                {log.verdict || "Analysis Done"}
              </span>
              <span className='text-3xl font-black text-blue-600'>
                {log.similarityScore}%
              </span>
            </div>

            <div className='grid grid-cols-2 gap-3 mb-6'>
              <div className='relative aspect-video bg-slate-50 rounded-2xl overflow-hidden border'>
                <img
                  src={log.img1Url}
                  alt='Sample 1'
                  className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
                />
              </div>
              <div className='relative aspect-video bg-slate-50 rounded-2xl overflow-hidden border'>
                <img
                  src={log.img2Url}
                  alt='Sample 2'
                  className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
                />
              </div>
            </div>

            <div className='pt-4 border-t border-slate-100 flex items-center justify-between'>
              <span className='text-[11px] text-slate-400 font-medium'>
                {new Date(log.createdAt).toLocaleDateString("en-GB")}
              </span>
              <Link
                href={`/results?id=${log._id}`}
                className='text-xs bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-blue-600 transition-colors font-semibold shadow-sm'>
                View Full Report
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
