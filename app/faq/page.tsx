import type { Metadata } from "next";
import { AppLayout, Footer } from "@/components/layout";
import { JsonLd, type FaqItem } from "@/components/seo";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Find answers to common questions about PDF-X privacy, zero server uploads, document limits, offline mode, and PDF tools.",
  alternates: {
    canonical: "/faq",
  },
  openGraph: {
    title: "Frequently Asked Questions",
    description:
      "Everything you need to know about PDF-X: 100% browser-based security, document limits, offline capabilities, and features.",
    url: "https://pdfx.tharidulakmal.com/faq",
  },
};

interface FaqCategory {
  category: string;
  items: FaqItem[];
}

const FAQ_CATEGORIES: FaqCategory[] = [
  {
    category: "Privacy & Security",
    items: [
      {
        question: "Are my PDF documents uploaded to any remote server or cloud?",
        answer:
          "Never. PDF-X operates 100% inside your browser. All file reading, page extraction, image rendering, merging, and compression execute locally in your computer or smartphone's memory. No file data is ever transmitted across the internet.",
      },
      {
        question: "Is PDF-X safe for sensitive legal, financial, or medical documents?",
        answer:
          "Yes. Because zero data leaves your local machine, PDF-X is inherently compatible with strict non-disclosure agreements (NDAs), GDPR privacy obligations, and HIPAA considerations that prohibit uploading confidential files to third-party cloud converters.",
      },
      {
        question: "Do you store file metadata, filenames, or analytical logs?",
        answer:
          "No. We do not store, inspect, or log your file names, page contents, or metadata. Once you close or reload the browser tab, your document is wiped from browser memory.",
      },
      {
        question: "Does PDF-X use cookies or third-party tracking pixels?",
        answer:
          "No. We do not use tracking cookies, invasive analytics, or third-party marketing pixels.",
      },
    ],
  },
  {
    category: "File Limits & Capabilities",
    items: [
      {
        question: "Is there a limit on file size or the number of documents I can process?",
        answer:
          "PDF-X enforces a generous client-side file size cap of 100MB per file to prevent browser memory exhaustion. There are no daily quotas, paywalls, or limits on how many times you can use the utilities.",
      },
      {
        question: "Can I use PDF-X completely offline?",
        answer:
          "Yes. Once the web application has finished loading in your browser, you can disconnect from Wi-Fi or cellular networks and continue merging, splitting, and organizing PDFs seamlessly.",
      },
      {
        question: "Are there any watermarks added to the downloaded documents?",
        answer:
          "No. PDF-X produces clean, watermark-free documents suitable for professional and personal distribution.",
      },
      {
        question: "Can I edit password-protected or encrypted PDF files?",
        answer:
          "Documents that are restricted by owner or user passwords must be unlocked before processing. PDF-X respects document cryptographic permissions.",
      },
    ],
  },
  {
    category: "Tools & Operations",
    items: [
      {
        question: "How does the page range syntax work in the PDF Splitter?",
        answer:
          "You can select individual pages ('1, 3, 5'), contiguous ranges ('1-5'), or mixed syntax ('1-3, 5, 8-12'). The input box and visual page cards sync bidirectionally in real time.",
      },
      {
        question: "Can I rotate individual pages without rotating the whole document?",
        answer:
          "Yes. In the Organize PDF utility, each page card has its own independent 90-degree rotation buttons, allowing you to fix upside-down or sideways pages individually.",
      },
      {
        question: "How does client-side PDF compression work?",
        answer:
          "PDF-X inspects the PDF document stream, removes redundant metadata, deduplicates font dictionaries, and resamples embedded raster graphics based on your chosen preset (Extreme, Recommended, or Light).",
      },
      {
        question: "Will compression degrade vector text or digital signatures?",
        answer:
          "No. Vector text outlines, fonts, digital forms, and vector drawings remain sharp and resolution-independent.",
      },
    ],
  },
  {
    category: "Performance & Troubleshooting",
    items: [
      {
        question: "What should I do if my browser shows a memory pressure warning?",
        answer:
          "If you are processing very large documents (hundreds of pages), PDF-X monitors browser memory and may recommend closing inactive tabs to free up RAM. Switching between Fast thumbnail mode and Visual mode also helps.",
      },
      {
        question: "Which browsers are officially supported?",
        answer:
          "PDF-X supports all modern evergreen browsers with HTML5 and WebAssembly capabilities, including Google Chrome, Mozilla Firefox, Apple Safari, Microsoft Edge, and mobile browsers on iOS and Android.",
      },
    ],
  },
];

const ALL_FAQS: FaqItem[] = FAQ_CATEGORIES.flatMap((c) => c.items);

export default function FaqPage() {
  return (
    <AppLayout>
      <main className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col">
        {/* Header */}
        <div className="mb-10 text-left">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 mt-2 leading-relaxed">
            Common questions regarding client-side security, file limits, and document processing.
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-col space-y-10 sm:space-y-12">
          {FAQ_CATEGORIES.map((category) => (
            <div key={category.category} className="flex flex-col">
              <h2 className="text-lg sm:text-xl font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-100">
                {category.category}
              </h2>

              <div className="flex flex-col space-y-3">
                {category.items.map((item, idx) => (
                  <details
                    key={idx}
                    className="group border border-neutral-200 rounded-xl bg-white p-4 sm:p-5 transition-colors duration-150 open:border-[#f8cfd5] open:bg-[#fdf2f4]/30"
                  >
                    <summary className="flex items-center justify-between font-semibold text-sm sm:text-base text-neutral-900 cursor-pointer select-none">
                      <span className="pr-3">{item.question}</span>
                      <span className="text-neutral-400 group-open:rotate-180 group-open:text-[#800020] transition-transform duration-200 shrink-0">
                        ▾
                      </span>
                    </summary>
                    <p className="mt-3 text-xs sm:text-sm text-neutral-600 leading-relaxed pr-2 sm:pr-6 pt-2 border-t border-neutral-100 group-open:border-[#f8cfd5]/50">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
      <JsonLd
        toolName="PDF-X FAQs"
        toolDescription="Frequently Asked Questions about PDF-X: 100% browser-based security, document limits, offline capabilities, and features."
        url="https://pdfx.tharidulakmal.com/faq"
        breadcrumbs={[
          { name: "Home", item: "/" },
          { name: "FAQ", item: "/faq" },
        ]}
        faqs={ALL_FAQS}
      />
    </AppLayout>
  );
}
