"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiChevronLeft, HiXMark } from "react-icons/hi2";
import Image from "next/image";
import {
  MergePdfIcon,
  ScissorsIcon,
  TrashIcon,
  LayersIcon,
  CompressIcon,
  ImageIcon,
  VinciAiIcon,
} from "@/components/common/icons";
import { useMobileNav } from "../MobileNavContext";

interface NavItem {
  id: string;
  name: string;
  description: string;
  icon: typeof MergePdfIcon;
  href: string;
}

const PRIMARY_TOOLS: NavItem[] = [
  {
    id: "merge",
    name: "Merge PDFs",
    description: "Combine multiple PDFs",
    icon: MergePdfIcon,
    href: "/",
  },
  {
    id: "split",
    name: "Split PDF",
    description: "Extract pages & ranges",
    icon: ScissorsIcon,
    href: "/split",
  },
  {
    id: "remove",
    name: "Remove Pages",
    description: "Delete unwanted pages",
    icon: TrashIcon,
    href: "/remove",
  },
  {
    id: "organize",
    name: "Organize PDF",
    description: "Reorder, rotate & manage",
    icon: LayersIcon,
    href: "/organize",
  },
  {
    id: "compress",
    name: "Compress PDF",
    description: "Reduce file size",
    icon: CompressIcon,
    href: "/compress",
  },
];

const SECONDARY_TOOLS: NavItem[] = [
  {
    id: "img-x",
    name: "IMG-X",
    description: "Image tools",
    icon: ImageIcon,
    href: "https://imgx.tharidulakmal.com",
  },
  {
    id: "vinci-ai",
    name: "Vinci AI",
    description: "Creative tools",
    icon: VinciAiIcon,
    href: "https://vinci.tharidulakmal.com",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isOpen: isMobileOpen, close: closeMobile } = useMobileNav();

  return (
    <>
      {/* ============================================================ */}
      {/* 1. MOBILE DRAWER OVERLAY & SLIDE-OUT PANEL (< md)             */}
      {/* ============================================================ */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-xs z-40 transition-opacity duration-300 md:hidden ${
          isMobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeMobile}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white z-50 shadow-2xl flex flex-col justify-between py-6 px-5 transition-transform duration-300 ease-in-out md:hidden ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
        }`}
        aria-label="Mobile Navigation"
      >
        <div className="flex flex-col">
          {/* Mobile Drawer Header */}
          <div className="flex items-center justify-between pb-6 mb-4 border-b border-neutral-100">
            <Link href="/" onClick={closeMobile} className="flex items-center gap-2">
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

          {/* Primary Tools Navigation */}
          <nav className="flex flex-col space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 px-3 mb-1">
              PDF Utilities
            </span>
            {PRIMARY_TOOLS.map((item) => {
              const IconComponent = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={closeMobile}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
                    isActive
                      ? "bg-[#fdf2f4] text-[#800020] font-semibold"
                      : "text-neutral-800 hover:bg-neutral-50 font-medium"
                  }`}
                >
                  <IconComponent className="w-5 h-5 text-[#800020] shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm leading-snug">{item.name}</span>
                    <span className="text-xs text-neutral-400 leading-none mt-0.5">
                      {item.description}
                    </span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Mobile Drawer Footer: Ecosystem & Info */}
        <div className="flex flex-col pt-4 border-t border-neutral-100 space-y-4">
          <div className="flex flex-col space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 px-3 mb-1">
              Ecosystem Tools
            </span>
            {SECONDARY_TOOLS.map((item) => {
              const IconComponent = item.icon;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3.5 py-2 rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  <IconComponent className="w-5 h-5 text-[#800020] shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium leading-snug">{item.name}</span>
                    <span className="text-xs text-neutral-400 leading-none mt-0.5">
                      {item.description}
                    </span>
                  </div>
                </a>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-neutral-500 px-3 pt-2 border-t border-neutral-100">
            <a
              href="https://tharidulakmal.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#800020] transition-colors"
            >
              About Author
            </a>
            <span>&bull;</span>
            <span className="text-emerald-700 font-medium">100% Private</span>
          </div>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* 2. DESKTOP STICKY COLLAPSIBLE SIDEBAR (>= md)                */}
      {/* ============================================================ */}
      <aside
        className={`hidden md:flex flex-col justify-between h-screen sticky top-0 py-6 select-none transition-[width] duration-300 ease-in-out shrink-0 z-30 border-r border-neutral-200 bg-white ${
          isCollapsed ? "w-20 min-w-20" : "w-64 min-w-64"
        }`}
        aria-label="Desktop Navigation"
      >
        <div className="flex flex-col">
          <div
            className={`flex items-center mb-7 transition-[padding] duration-200 ${
              isCollapsed ? "flex-col gap-3 px-3" : "justify-between px-5"
            }`}
          >
            <Link
              href="/"
              className="flex items-center min-w-0"
              title="PDF-X Home"
            >
              {isCollapsed ? (
                <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shrink-0 shadow-xs border border-neutral-100 bg-white">
                  <Image
                    src="/logo.webp"
                    alt="PDF-X"
                    width={40}
                    height={40}
                    priority
                    className="w-full h-full object-contain p-0.5"
                  />
                </div>
              ) : (
                <Image
                  src="/logo-2.webp"
                  alt="PDF-X"
                  width={150}
                  height={44}
                  priority
                  className="h-11 w-auto object-contain"
                />
              )}
            </Link>

            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 transition-colors duration-150 cursor-pointer shrink-0"
            >
              <HiChevronLeft
                className={`w-4 h-4 transition-transform duration-200 ease-in-out ${
                  isCollapsed ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          <nav className="flex flex-col space-y-1">
            {PRIMARY_TOOLS.map((item) => {
              const IconComponent = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

              if (isActive) {
                return (
                  <div
                    key={item.id}
                    title={item.name}
                    className={`relative flex items-center bg-[#fdf2f4] rounded-r-xl transition-[padding,colors] duration-200 cursor-pointer ${
                      isCollapsed ? "justify-center px-2 py-3" : "px-5 py-3"
                    }`}
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#800020] rounded-r" />
                    <IconComponent className="w-5 h-5 text-[#800020] shrink-0" />
                    <div
                      className={`flex flex-col transition-[max-width,opacity,transform] duration-200 ease-in-out overflow-hidden whitespace-nowrap ${
                        isCollapsed
                          ? "max-w-0 opacity-0 -translate-x-2 pointer-events-none"
                          : "max-w-[170px] opacity-100 translate-x-0 ml-3.5"
                      }`}
                    >
                      <span className="text-sm font-semibold text-[#800020] leading-snug">
                        {item.name}
                      </span>
                      <span className="text-xs text-neutral-500 leading-none mt-0.5">
                        {item.description}
                      </span>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  title={item.name}
                  className={`relative flex items-center text-neutral-800 hover:bg-neutral-50 rounded-r-xl transition-[padding,colors] duration-200 ${
                    isCollapsed ? "justify-center px-2 py-3" : "px-5 py-3"
                  }`}
                >
                  <IconComponent className="w-5 h-5 text-[#800020] shrink-0" />
                  <div
                    className={`flex flex-col transition-[max-width,opacity,transform] duration-200 ease-in-out overflow-hidden whitespace-nowrap ${
                      isCollapsed
                        ? "max-w-0 opacity-0 -translate-x-2 pointer-events-none"
                        : "max-w-[170px] opacity-100 translate-x-0 ml-3.5"
                    }`}
                  >
                    <span className="text-sm font-medium text-neutral-900 leading-snug">
                      {item.name}
                    </span>
                    <span className="text-xs text-neutral-400 leading-none mt-0.5">
                      {item.description}
                    </span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        <div
          className={`flex flex-col transition-[padding] duration-200 ${
            isCollapsed ? "px-2 pt-4" : "px-5 pt-6"
          }`}
        >
          <div className="flex flex-col space-y-1.5 mb-6">
            {SECONDARY_TOOLS.map((item) => {
              const IconComponent = item.icon;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={item.name}
                  className={`flex items-center text-neutral-800 hover:bg-neutral-50 rounded-lg transition-[padding,colors] duration-200 ${
                    isCollapsed ? "justify-center p-2.5" : "px-3 py-2"
                  }`}
                >
                  <IconComponent className="w-5 h-5 text-[#800020] shrink-0" />
                  <div
                    className={`flex flex-col transition-[max-width,opacity,transform] duration-200 ease-in-out overflow-hidden whitespace-nowrap ${
                      isCollapsed
                        ? "max-w-0 opacity-0 -translate-x-2 pointer-events-none"
                        : "max-w-[170px] opacity-100 translate-x-0 ml-3.5"
                    }`}
                  >
                    <span className="text-sm font-medium text-neutral-900 leading-snug">
                      {item.name}
                    </span>
                    <span className="text-xs text-neutral-400 leading-none mt-0.5">
                      {item.description}
                    </span>
                  </div>
                </a>
              );
            })}
          </div>

          <div
            className={`transition-[max-height,opacity] duration-200 overflow-hidden ${
              isCollapsed
                ? "max-h-0 opacity-0 border-transparent pointer-events-none"
                : "max-h-12 opacity-100 flex items-center gap-4 text-xs text-neutral-400 pt-3 border-t border-neutral-100"
            }`}
          >
            <a
              href="https://tharidulakmal.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-neutral-600 transition-colors duration-150"
            >
              About
            </a>
            <a
              href="https://tharidulakmal.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-neutral-600 transition-colors duration-150"
            >
              Contact
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}
