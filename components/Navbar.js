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

  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "Upload Samples", href: "/upload" },
    { name: "History", href: "/history" },
  ];

  if (!mounted) return null;

  return (
    <nav className='w-full max-w-1440px mx-auto px-4 md:px-8 pt-6 relative z-50'>
      <div className='bg-white/80 backdrop-blur-md border border-neutral-100 rounded-2xl md:rounded-full px-4 md:px-6 py-3 flex items-center shadow-sm justify-between'>
        <Link
          href='/'
          className='font-bold text-neutral-800 tracking-tight text-lg'>
          Script Match
        </Link>

        <div className='hidden md:flex items-center gap-8 text-neutral-600 font-medium text-sm absolute left-1/2 -translate-x-1/2'>
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`transition-all hover:text-black ${pathname === link.href ? "text-black border-b-2 border-amber-700/40 pb-0.5" : ""}`}>
              {link.name}
            </Link>
          ))}
        </div>

        <div className='flex items-center gap-3'>
          {!isLoaded ? (
            <div className='h-9 w-20 animate-pulse bg-neutral-100 rounded-xl'></div>
          ) : !isSignedIn ? (
            <div className='hidden md:flex items-center gap-2'>
              <SignInButton mode='modal'>
                <Button variant='ghost' className='rounded-xl text-sm h-10'>
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode='modal'>
                <Button className='rounded-xl bg-amber-700 text-white hover:bg-amber-800 text-sm h-10'>
                  Sign Up
                </Button>
              </SignUpButton>
            </div>
          ) : (
            <UserButton
              afterSignOutUrl='/'
              appearance={{
                elements: { avatarBox: "h-9 w-9 border-2 border-blue-500" },
              }}
            />
          )}

          <Button
            variant='ghost'
            size='icon'
            className='md:hidden'
            onClick={() => setIsOpen(true)}>
            <Menu className='h-6 w-6' />
          </Button>
        </div>
      </div>

      {isOpen && (
        <div className='fixed inset-0 bg-[#f4f0ea] z-[999] p-6 md:hidden animate-in fade-in duration-200'>
          <div className='flex justify-end'>
            <Button variant='ghost' onClick={() => setIsOpen(false)}>
              <X />
            </Button>
          </div>
          <div className='flex flex-col gap-4 mt-10'>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className='text-2xl font-bold p-4 hover:bg-white/50 rounded-2xl'>
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
