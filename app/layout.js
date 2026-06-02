import { Navbar } from "@/components/Navbar";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

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
            {/* 🌟 Header & Navigation - Isay ClerkProvider ke rules ke mutabiq load hona chahiye */}
            <Navbar />

            {/* Main Dynamic View Wrapper */}
            <main className='flex-1 w-full max-w-7xl mx-auto px-4 py-8 flex flex-col items-center justify-center animate-fade-in'>
              {children}
            </main>

            {/* Aesthetic Academic Footer */}
            <footer className='py-6 text-center text-[10px] text-slate-400 uppercase tracking-[0.2em] font-medium'>
              © 2026 Auto Script Match • IUB Final Year Project
            </footer>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
