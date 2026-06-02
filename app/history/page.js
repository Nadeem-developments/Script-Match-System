"use client";

import useSWR from "swr";
import Link from "next/link";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function HistoryPage() {
  const { data: response, mutate } = useSWR("/api/compare", fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
  });

  const items = response?.data || [];

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this forensic report?"))
      return;

    const previousItems = items;
    mutate(
      { ...response, data: items.filter((item) => item._id !== id) },
      false,
    );

    try {
      await fetch(`/api/compare/delete?id=${id}`, { method: "DELETE" });
      mutate();
    } catch (err) {
      mutate({ ...response, data: previousItems }, false);
      alert("Failed to delete record.");
    }
  };

  if (!response)
    return (
      <div className='flex justify-center p-20 text-slate-400'>
        Loading Secure Vault...
      </div>
    );

  return (
    <div className='w-full max-w-5xl mx-auto space-y-8 p-6'>
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6'>
        <div>
          <h1 className='text-3xl font-bold text-blue-600 tracking-tight'></h1>
          <p className='text-slate-500 text-sm mt-1'>
            Reviewing your past handwriting verification logs.
          </p>
        </div>
        <div className='bg-white px-4 py-2 rounded-2xl border shadow-sm inline-flex items-center gap-2'>
          <span className='h-2 w-2 bg-green-500 rounded-full animate-pulse'></span>
          <span className='text-xs font-bold text-slate-600 uppercase'>
            {items.length} Scans Secured
          </span>
        </div>
      </div>

      {items.length === 0 ? (
        <div className='text-center py-20'>
          <h2 className='text-xl font-semibold text-slate-400'>
            No Analysis Found
          </h2>
          <Link href='/upload' className='text-blue-600 font-bold'>
            Start First Verification
          </Link>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
          {items.map((log) => (
            <div
              key={log._id}
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
                    className='w-full h-full object-cover'
                  />
                </div>
                <div className='relative aspect-video bg-slate-50 rounded-2xl overflow-hidden border'>
                  <img
                    src={log.img2Url}
                    alt='Sample 2'
                    className='w-full h-full object-cover'
                  />
                </div>
              </div>

              <div className='pt-4 border-t border-slate-100 flex items-center justify-between'>
                <button
                  onClick={() => handleDelete(log._id)}
                  className='text-[10px] text-rose-400 hover:text-rose-600 font-bold uppercase'>
                  Delete
                </button>
                <Link
                  href={`/results?id=${log._id}`}
                  className='text-xs bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-blue-600 transition-colors font-semibold shadow-sm'>
                  View Report
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
