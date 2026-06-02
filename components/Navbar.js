"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs"; // 👈 SignUpButton import kiya

export function Navbar() {
  const { isSignedIn, isLoaded } = useUser();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Jab full screen menu open ho toh peeche page scroll na ho
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Upload Samples", href: "/upload" },
    { name: "History", href: "/history" },
  ];

  // Loading state skeleton
  if (!mounted) {
    return (
      <nav className='w-full max-w-[1440px] mx-auto px-4 md:px-8 pt-6'>
        <div className='bg-white/80 backdrop-blur-md border border-neutral-100 rounded-2xl md:rounded-full px-4 md:px-6 py-3 flex items-center justify-between shadow-sm'>
          <div className='h-10' />
        </div>
      </nav>
    );
  }

  return (
    <nav className='w-full max-w-[1440px] mx-auto px-4 md:px-8 pt-6 relative z-50'>
      {/* 1. MAIN DESKTOP & INITIAL MOBILE ROW */}
      <div
        className={`bg-white/80 backdrop-blur-md border border-neutral-100 rounded-2xl md:rounded-full px-4 md:px-6 py-3 flex items-center shadow-sm justify-between`}>
        {/* AGAR LOGGED IN HO: Tabhi links aur hamburger dikhao */}
        {isLoaded && isSignedIn ? (
          <>
            {/* Mobile Hamburger Trigger */}
            <div className='md:hidden'>
              <Button
                variant='ghost'
                size='icon'
                className='text-neutral-700 rounded-xl'
                onClick={() => setIsOpen(true)}>
                <Menu className='h-6 w-6' />
              </Button>
            </div>

            {/* Desktop Links */}
            <div className='hidden md:flex items-center gap-8 text-neutral-600 font-medium text-base'>
              {navLinks.map((link) => {
                const isActive = pathname === link.href;

                return (
                  <a
                    key={link.name}
                    href={link.href}
                    className={`transition-colors hover:text-black ${
                      isActive
                        ? "text-black border-b-2 border-amber-700/40 pb-0.5"
                        : ""
                    }`}>
                    {link.name}
                  </a>
                );
              })}
            </div>
          </>
        ) : (
          /* AGAR LOGGED OUT HO: Toh desktop par logo ya blank space manage karne ke liye empty div (Optional) */
          <div className='hidden md:block font-bold text-neutral-800'>Logo</div>
        )}

        {/* Desktop & Header Right Side */}
        <div className='flex items-center gap-3 md:gap-4 ml-auto md:ml-0'>
          {!isLoaded ? (
            <div className='h-9 w-9 animate-pulse bg-neutral-200 rounded-full'></div>
          ) : !isSignedIn ? (
            /* AGAR LOGGED OUT HO: Sign In aur Sign Up Buttons side-by-side dikhenge */
            <div className='flex items-center gap-2'>
              <SignInButton mode='modal'>
                <Button
                  variant='ghost'
                  className='rounded-xl font-medium px-4 text-neutral-700 hover:bg-neutral-100 text-sm h-10'>
                  Sign In
                </Button>
              </SignInButton>

              <SignUpButton mode='modal'>
                <Button className='rounded-xl bg-amber-700 text-white hover:bg-amber-800 font-medium px-5 text-sm h-10 shadow-sm transition-colors'>
                  Sign Up
                </Button>
              </SignUpButton>
            </div>
          ) : (
            /* User Logged In: Show Clerk Profile Avatar Dropdown */
            <UserButton
              afterSignOutUrl='/'
              appearance={{
                elements: {
                  avatarBox:
                    "h-8 w-8 md:h-9 md:w-9 border-2 border-blue-500 hover:scale-105 transition-transform",
                },
              }}
            />
          )}
        </div>
      </div>

      {/* 2. TOTALLY FULL-SCREEN MOBILE OVERLAY MENU */}
      {isOpen && isSignedIn && (
        <div className='fixed inset-0 w-full h-screen bg-[#f4f0ea] z-[999] flex flex-col p-6 md:hidden animate-in fade-in duration-200'>
          {/* Top Row Inside Full Screen */}
          <div className='flex items-center justify-between pb-6 border-b border-neutral-300/50'>
            <Button
              variant='ghost'
              size='icon'
              className='text-neutral-700 bg-white/50 rounded-xl'
              onClick={() => setIsOpen(false)}>
              <X className='h-6 w-6' />
            </Button>

            <span className='font-bold text-lg text-neutral-800'>
              Navigation
            </span>
          </div>

          {/* Center Links Container */}
          <div className='flex-1 flex flex-col justify-center gap-4 my-auto max-w-sm mx-auto w-full'>
            {navLinks.map((link) => {
              const isActive = pathname === link.href;

              return (
                <a
                  key={link.name}
                  href={link.href}
                  className={`w-full py-4 px-6 rounded-2xl text-center text-xl font-semibold transition-all ${
                    isActive
                      ? "bg-[#dfdad1] text-[#2c3e50] shadow-sm"
                      : "text-neutral-700 hover:bg-white/50"
                  }`}
                  onClick={() => setIsOpen(false)}>
                  {link.name}
                </a>
              );
            })}

            <hr className='border-neutral-300/60 my-4' />

            {/* Profile Section inside Mobile Menu */}
            <div className='flex items-center justify-center gap-3 py-3 px-6 rounded-2xl bg-white/40'>
              <UserButton
                afterSignOutUrl='/'
                appearance={{
                  elements: {
                    avatarBox: "h-9 w-9 border-2 border-blue-400",
                  },
                }}
              />
              <span className='text-base font-medium text-neutral-800'>
                Manage Account
              </span>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
