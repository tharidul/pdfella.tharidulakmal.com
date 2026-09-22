"use client";

import Image from "next/image";
import Link from "next/link";
import { HiBars3 } from "react-icons/hi2";
import { SunIcon } from "@/components/common/icons";
import { useMobileNav } from "../MobileNavContext";

export function Header() {
  const { toggle } = useMobileNav();

  return (
    <header className="w-full h-14 sm:h-16 flex items-center justify-between px-4 sm:px-8 border-b border-neutral-100 bg-white sticky top-0 z-20">
      <div className="flex items-center gap-3 md:hidden">
        <button
          type="button"
          onClick={toggle}
          aria-label="Open navigation menu"
          className="w-9 h-9 flex items-center justify-center rounded-lg text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
        >
          <HiBars3 className="w-6 h-6" />
        </button>

        <Link href="/" className="flex items-center gap-2 cursor-pointer">
          <Image
            src="/logo-2.webp"
            alt="PDF-X"
            width={100}
            height={30}
            priority
            className="h-8 w-auto object-contain"
          />
        </Link>
      </div>

      <div className="hidden md:block" />

      <div className="flex items-center gap-4 sm:gap-6">
        <nav aria-label="Header Navigation" className="hidden md:flex items-center gap-5 lg:gap-6">
          <Link
            href="/how-to-use"
            className="text-sm font-medium text-neutral-700 hover:text-brand-primary transition-colors cursor-pointer"
          >
            How to Use
          </Link>
          <Link
            href="/faq"
            className="text-sm font-medium text-neutral-700 hover:text-brand-primary transition-colors cursor-pointer"
          >
            FAQ
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium text-neutral-700 hover:text-brand-primary transition-colors cursor-pointer"
          >
            About
          </Link>
        </nav>

        <button
          type="button"
          aria-label="Toggle theme"
          className="w-9 h-9 flex items-center justify-center rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
        >
          <SunIcon className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
