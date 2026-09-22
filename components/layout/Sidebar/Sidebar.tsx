"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiXMark } from "react-icons/hi2";
import Image from "next/image";
import { useMobileNav } from "../MobileNavContext";
import { SidebarNavList } from "./SidebarNavList";

function PanelLeftCloseIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="18" height="18" x="3" y="3" rx="3.5" />
      <line x1="9" y1="3" x2="9" y2="21" />
    </svg>
  );
}

function PanelLeftOpenIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="18" height="18" x="3" y="3" rx="3.5" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <polyline points="13 9 16 12 13 15" />
    </svg>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isOpen: isMobileOpen, close: closeMobile } = useMobileNav();

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-xs z-40 transition-opacity duration-300 md:hidden cursor-pointer ${
          isMobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeMobile}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white z-50 shadow-2xl flex flex-col justify-between py-6 px-5 overflow-y-auto transition-transform duration-300 ease-in-out md:hidden ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
        }`}
        aria-label="Mobile Navigation"
      >
        <div className="flex flex-col">
          <div className="flex items-center justify-between pb-6 mb-4 border-b border-neutral-100">
            <Link href="/" onClick={closeMobile} className="flex items-center gap-2 cursor-pointer">
              <Image
                src="/logo-2.webp"
                alt="PDF-X"
                width={120}
                height={36}
                priority
                className="h-9 w-auto object-contain"
              />
            </Link>
            <button
              type="button"
              onClick={closeMobile}
              aria-label="Close menu"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <HiXMark className="w-5 h-5" />
            </button>
          </div>

          <SidebarNavList
            pathname={pathname}
            isMobile
            onItemClick={closeMobile}
          />
        </div>
      </aside>

      <aside
        aria-label="Desktop Navigation"
        className={`hidden md:flex flex-col justify-between py-6 bg-white border-r border-neutral-100 transition-[width] duration-300 ease-[cubic-bezier(0.2,0,0,1)] z-30 shrink-0 sticky top-0 h-screen overflow-y-auto ${
          isCollapsed ? "w-20 px-2" : "w-64 px-4"
        }`}
      >
        <div className="flex flex-col">
          <div className="pb-6 mb-2 border-b border-neutral-100">
            {isCollapsed ? (
              <div className="flex flex-col items-center gap-3">
                <Link
                  href="/"
                  title="PDF-X Home"
                  className="flex items-center justify-center p-1 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  <Image
                    src="/apple-icon.png"
                    alt="PDF-X"
                    width={32}
                    height={32}
                    priority
                    className="w-8 h-8 rounded-lg object-contain shadow-2xs"
                  />
                </Link>
                <button
                  type="button"
                  onClick={() => setIsCollapsed(false)}
                  aria-label="Expand sidebar"
                  title="Expand sidebar"
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors duration-150 cursor-pointer"
                >
                  <PanelLeftOpenIcon className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between pl-3 pr-1">
                <Link href="/" className="flex items-center gap-2 cursor-pointer">
                  <Image
                    src="/logo-2.webp"
                    alt="PDF-X"
                    width={120}
                    height={36}
                    priority
                    className="h-9 w-auto object-contain"
                  />
                </Link>

                <button
                  type="button"
                  onClick={() => setIsCollapsed(true)}
                  aria-label="Collapse sidebar"
                  title="Collapse sidebar"
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors duration-150 cursor-pointer shrink-0"
                >
                  <PanelLeftCloseIcon className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          <SidebarNavList
            pathname={pathname}
            isCollapsed={isCollapsed}
          />
        </div>
      </aside>
    </>
  );
}
