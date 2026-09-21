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
      {/* Mobile-only: Hamburger button & Brand Logo */}
      <div className="flex items-center gap-3 md:hidden">
        <button
          type="button"
          onClick={toggle}
          aria-label="Open navigation menu"
          className="w-9 h-9 flex items-center justify-center rounded-lg text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
        >
          <HiBars3 className="w-6 h-6" />
        </button>

        <Link href="/" className="flex items-center gap-2">
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

      {/* Desktop spacer when no mobile menu is shown */}
      <div className="hidden md:block" />

      {/* Right side navigation */}
      <div className="flex items-center gap-4 sm:gap-6">
        <nav className="hidden md:flex items-center gap-6">
          <a
            href="https://imgx.tharidulakmal.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-neutral-700 hover:text-[#800020] transition-colors"
          >
            IMG-X
          </a>
          <a
            href="https://vinci.tharidulakmal.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-neutral-700 hover:text-[#800020] transition-colors"
          >
            Vinci AI
          </a>
          <a
            href="https://tharidulakmal.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-neutral-700 hover:text-[#800020] transition-colors"
          >
            About
          </a>
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
