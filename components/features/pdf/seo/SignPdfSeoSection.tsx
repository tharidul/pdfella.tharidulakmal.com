import Link from "next/link";
import {
  HiCalendarDays,
  HiArrowRight,
  HiDevicePhoneMobile,
  HiLockClosed,
  HiCheckCircle,
  HiSparkles,
} from "react-icons/hi2";
import { FaSignature } from "react-icons/fa6";
import type { FaqItem } from "@/components/seo";

export const SIGN_PDF_FAQS: FaqItem[] = [
  {
    question: "How do I sign a PDF online for free?",
    answer:
      "Select or drop your PDF document into the PDFella upload area. Next, choose whether to draw your signature using a mouse, trackpad, or finger, type your name using elegant cursive fonts, or upload an image of your signature. Drag and position the signature onto the document, adjust its size, add an optional date stamp, and click 'Download Signed PDF'. The entire process is 100% free and requires no account or credit card.",
  },
  {
    question: "Can I create and download a signature image with a transparent background?",
    answer:
      "Yes! PDFella includes a standalone signature generator. Click 'Create & Download Signature PNG' on this page, choose between Draw, Type, or Upload, select 'Transparent Background', and download your high-resolution PNG. You can insert your transparent signature directly into Google Docs, Microsoft Word, email signatures, or scanned forms.",
  },
  {
    question: "Are electronic signatures legally binding?",
    answer:
      "Yes. Electronic signatures (e-signatures) created with PDFella are recognized as legally valid under the United States Electronic Signatures in Global and National Commerce Act (ESIGN Act), the Uniform Electronic Transactions Act (UETA), and European eIDAS regulations for standard electronic agreements, employment contracts, NDAs, and vendor proposals.",
  },
  {
    question: "Are my confidential documents uploaded to any remote servers?",
    answer:
      "No, never. Unlike conventional cloud PDF converters, PDFella processes everything 100% locally inside your web browser using HTML5 Canvas and WebAssembly. Your files, signatures, and private data never traverse the internet or touch any external server, satisfying strict NDA, HIPAA, and GDPR data sovereignty standards.",
  },
  {
    question: "Can I add a date stamp alongside my signature?",
    answer:
      "Yes. With a single click on 'Add Date Stamp', PDFella places an auto-formatted date box onto your document. You can drag the date stamp to sit beside or underneath your signature and adjust its position precisely.",
  },
  {
    question: "Can I sign a PDF on my phone or tablet?",
    answer:
      "Yes. PDFella is fully mobile-optimized for iPhone, iPad, Android smartphones, and tablets. You can use your touchscreen or Apple Pencil/stylus to draw a smooth, natural handwritten signature directly in your mobile browser without installing third-party apps.",
  },
];

interface SignPdfSeoSectionProps {
  onOpenSignatureModal?: () => void;
}

export function SignPdfSeoSection({ onOpenSignatureModal }: SignPdfSeoSectionProps) {
  return (
    <section aria-label="Sign PDF guide and features" className="mt-10 pt-8 border-t border-neutral-200 space-y-10 sm:space-y-12">
      {/* 1. Step-by-Step How-To Guide */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-subtle text-brand-primary text-xs font-bold uppercase tracking-wider">
            <HiSparkles className="w-3.5 h-3.5" />
            Simple 4-Step Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
            How to Sign a PDF Document Online
          </h2>
          <p className="text-sm text-neutral-600">
            Sign legal contracts, lease agreements, tax forms, and NDAs in seconds without printing or scanning.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="flex flex-col p-5 rounded-2xl border border-neutral-200/90 bg-white shadow-2xs hover:border-brand-border transition-colors">
            <div className="w-8 h-8 rounded-xl bg-brand-subtle text-brand-primary font-bold text-sm flex items-center justify-center mb-3">
              1
            </div>
            <h3 className="text-sm font-bold text-neutral-900 mb-1.5">
              Upload PDF File
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Drag & drop your document into the box above or click to browse. Files load instantly into your local browser memory.
            </p>
          </div>

          <div className="flex flex-col p-5 rounded-2xl border border-neutral-200/90 bg-white shadow-2xs hover:border-brand-border transition-colors">
            <div className="w-8 h-8 rounded-xl bg-brand-subtle text-brand-primary font-bold text-sm flex items-center justify-center mb-3">
              2
            </div>
            <h3 className="text-sm font-bold text-neutral-900 mb-1.5">
              Create Your Signature
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Draw your signature with a mouse or stylus, type your name in smooth cursive fonts, or upload a scanned signature image.
            </p>
          </div>

          <div className="flex flex-col p-5 rounded-2xl border border-neutral-200/90 bg-white shadow-2xs hover:border-brand-border transition-colors">
            <div className="w-8 h-8 rounded-xl bg-brand-subtle text-brand-primary font-bold text-sm flex items-center justify-center mb-3">
              3
            </div>
            <h3 className="text-sm font-bold text-neutral-900 mb-1.5">
              Position & Add Date Stamp
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Drag your signature box to the exact signing line. Resize as needed and insert a one-click formatted date stamp.
            </p>
          </div>

          <div className="flex flex-col p-5 rounded-2xl border border-neutral-200/90 bg-white shadow-2xs hover:border-brand-border transition-colors">
            <div className="w-8 h-8 rounded-xl bg-brand-subtle text-brand-primary font-bold text-sm flex items-center justify-center mb-3">
              4
            </div>
            <h3 className="text-sm font-bold text-neutral-900 mb-1.5">
              Download Signed PDF
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Export your finalized PDF immediately with zero watermarks and zero compression degradation.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Core Features & User Search Intent Grid */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
            Comprehensive Online e-Signing Features
          </h2>
          <p className="text-sm text-neutral-600">
            Designed to solve real-world document workflow needs with speed, versatility, and strict privacy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl border border-neutral-200 bg-white shadow-2xs space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-brand-subtle text-brand-primary flex items-center justify-center">
              <FaSignature className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900">
              Draw, Type, or Upload Signature
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Create an electronic signature whichever way you prefer: sketch naturally with touch/mouse, type your name in stylized handwriting scripts, or upload a photo of your signature.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-neutral-200 bg-white shadow-2xs space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-brand-subtle text-brand-primary flex items-center justify-center">
              <HiSparkles className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900">
              Transparent PNG Signature Downloader
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Need a reusable signature image for email footers, Word documents, or Google Docs? Generate and download high-resolution PNG signatures with transparent backgrounds.
            </p>
            {onOpenSignatureModal && (
              <button
                type="button"
                onClick={onOpenSignatureModal}
                className="text-xs font-semibold text-brand-primary hover:text-brand-primary-hover hover:underline inline-flex items-center gap-1 cursor-pointer pt-1"
              >
                Create signature image now →
              </button>
            )}
          </div>

          <div className="p-5 rounded-2xl border border-neutral-200 bg-white shadow-2xs space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-brand-subtle text-brand-primary flex items-center justify-center">
              <HiCalendarDays className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900">
              Interactive Date Stamping
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Quickly stamp today’s date in standard format onto your document alongside your signature without needing a separate PDF editor or text tool.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-neutral-200 bg-white shadow-2xs space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-brand-subtle text-brand-primary flex items-center justify-center">
              <HiLockClosed className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900">
              100% Private Client-Side Signing
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Zero cloud uploads. All rendering, signature placing, and PDF flattening occur strictly within your browser. Safe for NDAs, medical records, and confidential contracts.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-neutral-200 bg-white shadow-2xs space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-brand-subtle text-brand-primary flex items-center justify-center">
              <HiCheckCircle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900">
              No Sign-Up or Registration Required
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Forget mandatory account creation, credit card prompts, and daily usage paywalls. Start signing documents immediately with zero friction.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-neutral-200 bg-white shadow-2xs space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-brand-subtle text-brand-primary flex items-center justify-center">
              <HiDevicePhoneMobile className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900">
              Works Across All Devices & Touchscreens
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Optimized for mobile touchscreens, iPad stylus inputs, Mac, Windows, and Linux. Sign contracts anywhere on the go from your browser.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Frequently Asked Questions (People Also Ask) */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-neutral-600">
            Answers to common questions about electronic signatures, legality, and browser security.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {SIGN_PDF_FAQS.map((faq, idx) => (
            <details
              key={idx}
              className="group border border-neutral-200 rounded-xl bg-white p-4 sm:p-5 transition-colors duration-150 open:border-brand-border open:bg-brand-subtle/30"
            >
              <summary className="flex items-center justify-between font-semibold text-sm sm:text-base text-neutral-900 cursor-pointer select-none">
                <span className="pr-3">{faq.question}</span>
                <span className="text-neutral-400 group-open:rotate-180 group-open:text-brand-primary transition-transform duration-200 shrink-0">
                  ▾
                </span>
              </summary>
              <p className="mt-3 text-xs sm:text-sm text-neutral-600 leading-relaxed pr-2 sm:pr-6 pt-2 border-t border-neutral-100 group-open:border-brand-border/50">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>

      {/* 4. Contextual Internal Linking to Other PDF Options */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
            Explore More Free PDF Tools
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500">
            Complete your document management workflow with our suite of private, client-side tools.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/compress"
            className="group p-4 rounded-xl border border-neutral-200/90 bg-white hover:border-brand-primary hover:shadow-xs transition-all flex flex-col justify-between"
          >
            <div>
              <span className="text-xs font-bold text-neutral-900 group-hover:text-brand-primary transition-colors">
                Compress PDF
              </span>
              <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
                Reduce PDF file size for easy email attachment while preserving signature quality.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-brand-primary mt-3 inline-flex items-center gap-1 group-hover:gap-1.5 transition-all">
              Shrink PDF size <HiArrowRight className="w-3 h-3" />
            </span>
          </Link>

          <Link
            href="/"
            className="group p-4 rounded-xl border border-neutral-200/90 bg-white hover:border-brand-primary hover:shadow-xs transition-all flex flex-col justify-between"
          >
            <div>
              <span className="text-xs font-bold text-neutral-900 group-hover:text-brand-primary transition-colors">
                Merge PDF
              </span>
              <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
                Combine multiple signed agreements or exhibits into a single continuous file.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-brand-primary mt-3 inline-flex items-center gap-1 group-hover:gap-1.5 transition-all">
              Combine files <HiArrowRight className="w-3 h-3" />
            </span>
          </Link>

          <Link
            href="/split"
            className="group p-4 rounded-xl border border-neutral-200/90 bg-white hover:border-brand-primary hover:shadow-xs transition-all flex flex-col justify-between"
          >
            <div>
              <span className="text-xs font-bold text-neutral-900 group-hover:text-brand-primary transition-colors">
                Split PDF
              </span>
              <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
                Extract signed signature pages or specific page ranges into standalone documents.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-brand-primary mt-3 inline-flex items-center gap-1 group-hover:gap-1.5 transition-all">
              Extract pages <HiArrowRight className="w-3 h-3" />
            </span>
          </Link>

          <Link
            href="/organize"
            className="group p-4 rounded-xl border border-neutral-200/90 bg-white hover:border-brand-primary hover:shadow-xs transition-all flex flex-col justify-between"
          >
            <div>
              <span className="text-xs font-bold text-neutral-900 group-hover:text-brand-primary transition-colors">
                Organize PDF
              </span>
              <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
                Reorder, rotate sideways pages, and delete unwanted pages before sending for signing.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-brand-primary mt-3 inline-flex items-center gap-1 group-hover:gap-1.5 transition-all">
              Reorder pages <HiArrowRight className="w-3 h-3" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
