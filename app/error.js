"use client";
export default function Error({ error, reset }) {
  return (
    <div className='flex flex-col items-center justify-center h-screen'>
      <h2 className='text-xl font-bold'>Any error accure!</h2>
      <button
        onClick={() => reset()}
        className='bg-blue-600 text-white px-4 py-2 mt-4 rounded-xl'>
        try again
      </button>
    </div>
  );
}
