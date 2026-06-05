"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";

export function Navbar() {
  const { isSignedIn, isLoaded } = useUser();
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "Upload Samples", href: "/upload" },
    { name: "History", href: "/history" },
  ];

  if (!mounted) return null;

  return (
    <nav className='w-full max-w-6xl mx-auto px-4 md:px-8 pt-6 relative z-50'>
      {/* TOP BAR */}
      <div className='bg-white/80 backdrop-blur-md border border-neutral-100 rounded-2xl md:rounded-full px-4 md:px-6 py-3 flex items-center shadow-sm justify-between'>
        {/* LOGO */}
        <Link
          href='/'
          className='font-bold text-neutral-800 text-lg tracking-tight'>
          Script Match
        </Link>

        {/* DESKTOP NAV */}
        <div className='hidden md:flex items-center gap-8 text-sm font-medium text-neutral-600 absolute left-1/2 -translate-x-1/2'>
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`transition hover:text-black ${
                pathname === link.href
                  ? "text-black border-b-2 border-amber-600 pb-0.5"
                  : ""
              }`}>
              {link.name}
            </Link>
          ))}
        </div>

        {/* RIGHT SIDE */}
        <div className='flex items-center gap-3'>
          {!isLoaded ? (
            <div className='h-9 w-20 animate-pulse bg-neutral-100 rounded-xl' />
          ) : !isSignedIn ? (
            <div className='hidden md:flex items-center gap-2'>
              <SignInButton mode='modal'>
                <Button variant='ghost' className='rounded-xl h-10'>
                  Sign In
                </Button>
              </SignInButton>

              <SignUpButton mode='modal'>
                <Button className='rounded-xl bg-amber-700 text-white hover:bg-amber-800 h-10'>
                  Sign Up
                </Button>
              </SignUpButton>
            </div>
          ) : (
            <UserButton
              afterSignOutUrl='/'
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9 border-2 border-amber-600",
                },
              }}
            />
          )}

          {/* MOBILE BUTTON */}
          <Button
            variant='ghost'
            size='icon'
            className='md:hidden'
            onClick={() => setIsOpen(true)}>
            <Menu className='h-6 w-6' />
          </Button>
        </div>
      </div>

      {/* =========================
          AESTHETIC SIDEBAR MOBILE
      ========================== */}

      {/* BACKDROP */}
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* SIDEBAR */}
      <div
        className={`fixed top-0 right-0 h-full w-[78%] max-w-sm bg-white/80 backdrop-blur-xl border-l border-neutral-200 shadow-2xl z-[999] transform transition-transform duration-300 md:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}>
        {/* HEADER */}
        <div className='flex items-center justify-between p-5 border-b border-neutral-100'>
          <span className='font-bold text-lg'>Menu</span>

          <button onClick={() => setIsOpen(false)}>
            <X className='h-6 w-6' />
          </button>
        </div>

        {/* LINKS */}
        <div className='flex flex-col p-5 gap-3'>
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`p-4 rounded-2xl text-lg font-semibold transition ${
                pathname === link.href
                  ? "bg-amber-50 text-amber-700"
                  : "hover:bg-neutral-100"
              }`}>
              {link.name}
            </Link>
          ))}
        </div>

        {/* AUTH SECTION */}
        {!isSignedIn && (
          <div className='absolute bottom-6 left-0 right-0 px-5 flex flex-col gap-3'>
            <SignInButton mode='modal'>
              <Button className='w-full rounded-xl'>Sign In</Button>
            </SignInButton>

            <SignUpButton mode='modal'>
              <Button className='w-full rounded-xl bg-amber-700 text-white'>
                Sign Up
              </Button>
            </SignUpButton>
          </div>
        )}
      </div>
    </nav>
  );
}
