import type { FC } from "react";
import Link from "next/link";
import { HiCheckCircle, HiLockClosed, HiBolt, HiGift, HiWifi } from "react-icons/hi2";
import type { FaqItem } from "./JsonLd";

export interface StepItem {
  number: string;
  title: string;
  description: string;
}

export interface RelatedToolItem {
  id: string;
  name: string;
  description: string;
  href: string;
  badge?: string;
}

interface ToolInfoSectionProps {
  toolName: string;
  actionWord: string;
  steps: StepItem[];
  faqs: FaqItem[];
  currentRoute: string;
}

const ALL_TOOLS: RelatedToolItem[] = [
  {
    id: "merge",
    name: "Merge PDFs",
    description: "Combine multiple PDF documents into a single organized file.",
    href: "/",
  },
  {
    id: "split",
    name: "Split PDF",
    description: "Extract specific pages or custom numeric ranges from any PDF.",
    href: "/split",
  },
  {
    id: "remove",
    name: "Remove Pages",
    description: "Delete unwanted or sensitive pages from your PDF document.",
    href: "/remove",
  },
  {
    id: "organize",
    name: "Organize PDF",
    description: "Reorder, rotate orientations, and manage PDF pages visually.",
    href: "/organize",
  },
  {
    id: "compress",
    name: "Compress PDF",
    description: "Reduce PDF file size while preserving high visual quality.",
    href: "/compress",
  },
];

export const ToolInfoSection: FC<ToolInfoSectionProps> = ({
  toolName,
  actionWord,
  steps,
  faqs,
  currentRoute,
}) => {
  const relatedTools = ALL_TOOLS.filter((t) => t.href !== currentRoute);

  return (
    <section className="w-full max-w-4xl mx-auto px-4 sm:px-8 pt-10 sm:pt-16 pb-8 flex flex-col space-y-12 sm:space-y-16">
      {/* 1. How It Works Steps */}
      <div className="flex flex-col">
        <div className="flex flex-col mb-6 sm:mb-8 text-center sm:text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-[#800020] mb-1">
            STEP-BY-STEP GUIDE
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
            How to {actionWord} in 3 simple steps
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Experience ultra-fast, client-side PDF processing without uploading documents to external servers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {steps.map((step) => (
            <div
              key={step.number}
              className="relative p-5 sm:p-6 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 hover:bg-neutral-50/90 transition-colors flex flex-col justify-between"
            >
              <div>
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#fdf2f4] text-[#800020] font-bold text-sm mb-4 border border-[#f8cfd5]">
                  {step.number}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-neutral-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                <HiCheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Client-side instant</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Privacy & Performance Pillars */}
      <div className="flex flex-col">
        <div className="flex flex-col mb-6 sm:mb-8 text-center sm:text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-[#800020] mb-1">
            SECURITY & SPEED
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
            Why choose PDF-X for your documents?
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Engineered from the ground up for strict confidentiality and modern browser performance.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <div className="p-4 sm:p-5 rounded-2xl border border-neutral-200/80 bg-white flex items-start gap-3.5 sm:gap-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#800020] flex items-center justify-center shrink-0 border border-rose-100">
              <HiLockClosed className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 mb-1">
                100% Client-Side Privacy
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Zero server uploads. Your confidential legal, financial, or personal files are processed strictly inside your device&apos;s memory.
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl border border-neutral-200/80 bg-white flex items-start gap-3.5 sm:gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-100">
              <HiBolt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 mb-1">
                Instant Processing Speed
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Skip sluggish upload and download queues. Client-side execution produces immediate results even with multi-hundred-page files.
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl border border-neutral-200/80 bg-white flex items-start gap-3.5 sm:gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
              <HiGift className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 mb-1">
                Free Forever & No Watermarks
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                No credit cards, subscriptions, daily file quotas, or intrusive watermarks. Clean documents ready for professional use.
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl border border-neutral-200/80 bg-white flex items-start gap-3.5 sm:gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
              <HiWifi className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 mb-1">
                Fully Offline Capable
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Once loaded in your browser, PDF-X functions completely without an internet connection. Perfect for flights or secure facilities.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Frequently Asked Questions (FAQ) */}
      <div className="flex flex-col">
        <div className="flex flex-col mb-5 sm:mb-6 text-center sm:text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-[#800020] mb-1">
            QUESTIONS & ANSWERS
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
            Frequently Asked Questions about {toolName}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Common questions regarding security, document formats, and usage limits.
          </p>
        </div>

        <div className="flex flex-col space-y-3">
          {faqs.map((faq, idx) => (
            <details
              key={idx}
              className="group border border-neutral-200 rounded-xl bg-white p-3.5 sm:p-4.5 transition-all open:border-[#f8cfd5] open:bg-[#fdf2f4]/30"
            >
              <summary className="flex items-center justify-between font-semibold text-xs sm:text-sm text-neutral-900 cursor-pointer select-none">
                <span className="pr-2">{faq.question}</span>
                <span className="text-neutral-400 group-open:rotate-180 group-open:text-[#800020] transition-transform duration-200 shrink-0">
                  ▾
                </span>
              </summary>
              <p className="mt-3 text-xs text-neutral-600 leading-relaxed pr-2 sm:pr-6 pt-2 border-t border-neutral-100 group-open:border-[#f8cfd5]/50">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>

      {/* 4. Related Tools / Internal Links */}
      <div className="flex flex-col pt-2 sm:pt-4">
        <div className="flex flex-col mb-5 sm:mb-6 text-center sm:text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-[#800020] mb-1">
            MORE TOOLS
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
            Other Free PDF Utilities
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Switch between privacy-first PDF utilities with a single click.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {relatedTools.map((tool) => (
            <Link
              key={tool.id}
              href={tool.href}
              className="p-3.5 sm:p-4 rounded-xl border border-neutral-200/80 bg-white hover:border-[#800020]/40 hover:shadow-xs transition-all flex flex-col justify-between group"
            >
              <div>
                <h3 className="text-sm font-bold text-neutral-900 group-hover:text-[#800020] transition-colors mb-1">
                  {tool.name} &rarr;
                </h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  {tool.description}
                </p>
              </div>
              <span className="text-[11px] font-semibold text-[#800020] mt-3">
                100% Private
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
