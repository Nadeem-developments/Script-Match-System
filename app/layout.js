import { Navbar } from "@/components/Navbar";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { SWRConfig } from "swr";
import { SWRProvider } from "@/lib/swr-provider";
export const metadata = {
  title: "Auto Script Match",
  description: "AI-Powered Handwriting Matching System",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang='en'>
        <body className='bg-[#f4f0ea] text-slate-900 antialiased'>
          <div className='min-h-screen flex flex-col'>
            <Navbar />

            <main className='flex-1 w-full max-w-7xl mx-auto px-4 py-8 flex flex-col items-center justify-center animate-fade-in'>
              <SWRProvider>{children}</SWRProvider>
            </main>

            <footer className='py-6 text-center text-[10px] text-slate-400 uppercase tracking-[0.2em] font-medium'>
              © 2026 Script-Match • IUB Final Year Project M Nadeeem
              F22BSEEN1M01127 2M 8th
            </footer>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
