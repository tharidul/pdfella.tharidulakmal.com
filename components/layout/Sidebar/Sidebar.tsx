"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiXMark } from "react-icons/hi2";
import Image from "next/image";
import {
  MergePdfIcon,
  ScissorsIcon,
  TrashIcon,
  LayersIcon,
  CompressIcon,
  ImagesToPdfIcon,
  PdfToImageIcon,
  PageNumbersIcon,
  WatermarkIcon,
  SignPdfIcon,
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
  {
    id: "image-to-pdf",
    name: "Images to PDF",
    description: "Convert JPG/PNG to PDF",
    icon: ImagesToPdfIcon,
    href: "/image-to-pdf",
  },
  {
    id: "pdf-to-image",
    name: "PDF to Images",
    description: "Export PNG/JPG or ZIP",
    icon: PdfToImageIcon,
    href: "/pdf-to-image",
  },
  {
    id: "page-numbers",
    name: "Page Numbers",
    description: "Add headers & numbering",
    icon: PageNumbersIcon,
    href: "/page-numbers",
  },
  {
    id: "watermark",
    name: "Watermark PDF",
    description: "Stamp text or logo",
    icon: WatermarkIcon,
    href: "/watermark",
  },
  {
    id: "sign",
    name: "Sign PDF",
    description: "Add e-signatures & stamps",
    icon: SignPdfIcon,
    href: "/sign",
  },
];

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
      {/* ============================================================ */}
      {/* 1. MOBILE DRAWER OVERLAY & SLIDE-OUT PANEL (< md)             */}
      {/* ============================================================ */}
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
          {/* Mobile Drawer Header */}
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

          {/* Primary Tools Navigation */}
          <nav aria-label="Mobile Tools Navigation" className="flex flex-col space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 px-3 mb-1">
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
                  prefetch={false}
                  onClick={closeMobile}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer ${
                    isActive
                      ? "bg-brand-subtle text-brand-primary font-semibold"
                      : "text-neutral-800 hover:bg-neutral-50 font-medium"
                  }`}
                >
                  <IconComponent className="w-5 h-5 text-brand-primary shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm leading-snug">{item.name}</span>
                    <span className="text-xs text-neutral-600 leading-none mt-0.5">
                      {item.description}
                    </span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Mobile Drawer Footer: Resources & Ecosystem */}
        <div className="flex flex-col pt-4 border-t border-neutral-100 space-y-4">
          <div className="flex flex-col space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 px-3 mb-1">
              Resources & Info
            </span>
            <Link
              href="/how-to-use"
              onClick={closeMobile}
              className="flex items-center px-3.5 py-1.5 rounded-lg text-xs font-medium text-neutral-700 hover:bg-neutral-50 hover:text-brand-primary transition-colors cursor-pointer"
            >
              How to Use
            </Link>
            <Link
              href="/faq"
              onClick={closeMobile}
              className="flex items-center px-3.5 py-1.5 rounded-lg text-xs font-medium text-neutral-700 hover:bg-neutral-50 hover:text-brand-primary transition-colors cursor-pointer"
            >
              Frequently Asked Questions (FAQ)
            </Link>
            <Link
              href="/about"
              onClick={closeMobile}
              className="flex items-center px-3.5 py-1.5 rounded-lg text-xs font-medium text-neutral-700 hover:bg-neutral-50 hover:text-brand-primary transition-colors cursor-pointer"
            >
              About PDF-X
            </Link>
            <Link
              href="/privacy"
              onClick={closeMobile}
              className="flex items-center px-3.5 py-1.5 rounded-lg text-xs font-medium text-neutral-700 hover:bg-neutral-50 hover:text-brand-primary transition-colors cursor-pointer"
            >
              Privacy Policy & Security
            </Link>
          </div>



          <div className="flex items-center text-xs text-neutral-500 px-3 pt-2 border-t border-neutral-100">
            <a
              href="https://tharidulakmal.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brand-primary transition-colors cursor-pointer"
            >
              By Tharidu Lakmal
            </a>
          </div>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* 2. DESKTOP STICKY COLLAPSIBLE SIDEBAR (>= md)                */}
      {/* ============================================================ */}
      <aside
        className={`hidden md:flex flex-col justify-between h-screen sticky top-0 select-none transition-[width] duration-300 ease-[cubic-bezier(0.2,0,0,1)] shrink-0 z-30 border-r border-neutral-200 bg-white overflow-hidden ${
          isCollapsed ? "w-20" : "w-64"
        }`}
        aria-label="Desktop Navigation"
      >
        {/* Scrollable inner content container with hidden scrollbar */}
        <div className="flex-1 flex flex-col justify-between overflow-y-auto overflow-x-hidden py-4 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex flex-col">
            {/* Header: Gemini Style Brand & Sidebar Toggle */}
            <div className="flex items-center h-12 mb-5 px-5 relative">
              {/* Collapsed Logo Button (visible when collapsed) */}
              <button
                type="button"
                onClick={() => setIsCollapsed(false)}
                aria-label="Expand sidebar"
                title="Expand sidebar"
                className={`group absolute left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-[opacity,transform] duration-200 cursor-pointer shrink-0 ${
                  isCollapsed ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
                }`}
              >
                <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center transition-opacity duration-150 group-hover:opacity-0 shrink-0">
                  <Image
                    src="/logo.webp"
                    alt="PDF-X"
                    width={32}
                    height={32}
                    priority
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  <PanelLeftOpenIcon className="w-5 h-5 text-neutral-700" />
                </div>
              </button>

              {/* Expanded Header View (visible when expanded) */}
              <div
                className={`flex items-center justify-between w-full transition-[opacity,transform] duration-250 ease-out ${
                  isCollapsed ? "opacity-0 scale-98 pointer-events-none" : "opacity-100 scale-100 pointer-events-auto"
                }`}
              >
                <Link
                  href="/"
                  className="flex items-center min-w-0 cursor-pointer"
                  title="PDF-X Home"
                >
                  <Image
                    src="/logo-2.webp"
                    alt="PDF-X"
                    width={130}
                    height={38}
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
            </div>

          <nav aria-label="Tools Navigation" className="flex flex-col space-y-1">
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
                    className="relative flex items-center px-5 py-3 bg-brand-subtle rounded-r-xl transition-colors duration-200 cursor-pointer"
                  >
                    <div className="absolute left-0 top-1 bottom-1 w-1 bg-brand-primary rounded-r" />
                    <div className="w-10 h-6 flex items-center justify-center shrink-0">
                      <IconComponent className="w-5 h-5 text-brand-primary" />
                    </div>
                    <div
                      className={`flex flex-col overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${
                        isCollapsed
                          ? "max-w-0 opacity-0 pointer-events-none"
                          : "max-w-[170px] opacity-100 ml-2"
                      }`}
                    >
                      <span className="text-sm font-semibold text-brand-primary leading-snug">
                        {item.name}
                      </span>
                      <span className="text-xs text-neutral-600 leading-none mt-0.5">
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
                  prefetch={false}
                  title={item.name}
                  className="relative flex items-center px-5 py-3 text-neutral-800 hover:bg-neutral-50 rounded-r-xl transition-colors duration-200 cursor-pointer"
                >
                  <div className="w-10 h-6 flex items-center justify-center shrink-0">
                    <IconComponent className="w-5 h-5 text-brand-primary" />
                  </div>
                  <div
                    className={`flex flex-col overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${
                      isCollapsed
                        ? "max-w-0 opacity-0 pointer-events-none"
                        : "max-w-[170px] opacity-100 ml-2"
                    }`}
                  >
                    <span className="text-sm font-medium text-neutral-900 leading-snug">
                      {item.name}
                    </span>
                    <span className="text-xs text-neutral-600 leading-none mt-0.5">
                      {item.description}
                    </span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex flex-col px-5 pt-2">

          <div
            className={`transition-[max-height,opacity] duration-200 overflow-hidden ${
              isCollapsed
                ? "max-h-0 opacity-0 border-transparent pointer-events-none"
                : "max-h-24 opacity-100 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-neutral-500 pt-3 border-t border-neutral-100"
            }`}
          >
            <Link
              href="/how-to-use"
              className="hover:text-brand-primary transition-colors duration-150 cursor-pointer"
            >
              How to Use
            </Link>
            <Link
              href="/faq"
              className="hover:text-brand-primary transition-colors duration-150 cursor-pointer"
            >
              FAQ
            </Link>
            <Link
              href="/about"
              className="hover:text-brand-primary transition-colors duration-150 cursor-pointer"
            >
              About
            </Link>
            <Link
              href="/privacy"
              className="hover:text-brand-primary transition-colors duration-150 cursor-pointer"
            >
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </aside>
    </>
  );
}
