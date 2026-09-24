import type { Metadata } from "next";
import { AppLayout } from "@/components/layout";
import { JsonLd } from "@/components/seo";
import {
  HiShieldCheck,
  HiBolt,
  HiLockClosed,
  HiGlobeAlt,
  HiArrowTopRightOnSquare,
} from "react-icons/hi2";

export const metadata: Metadata = {
  title: "About PDFella",
  description:
    "Learn about PDFella's mission, technology architecture, and commitment to total document privacy with zero server uploads.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About PDFella",
    description:
      "Why we built PDFella: a zero-server, privacy-first PDF utility suite that keeps your files 100% safe in your local browser memory.",
    url: "https://pdfella.tharidulakmal.com/about",
    images: ["/og-image.jpg"],
  },
};

const PRINCIPLES = [
  {
    icon: HiShieldCheck,
    title: "100% Private (No Uploads)",
    description:
      "PDFella never uploads your documents to remote servers. All computation runs exclusively inside your browser memory.",
  },
  {
    icon: HiBolt,
    title: "Instant Execution",
    description:
      "No waiting for large uploads or remote processing queues. Tasks happen locally at native speeds.",
  },
  {
    icon: HiLockClosed,
    title: "Confidentiality & Compliance",
    description:
      "Because confidential data never leaves your device, PDFella is inherently compatible with NDAs and privacy standards.",
  },
  {
    icon: HiGlobeAlt,
    title: "Offline Capable",
    description:
      "Once loaded in your browser, PDFella continues to work without an active internet connection.",
  },
];

export default function AboutPage() {
  return (
    <AppLayout>
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-10 text-left">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
            About PDFella
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 mt-2 leading-relaxed">
            A fast, private PDF utility suite that executes all operations locally in browser memory with zero server uploads.
          </p>
        </div>

        <div className="space-y-6">
          <section className="bg-white rounded-xl border border-neutral-200/80 p-6 shadow-2xs space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900">
              Why We Built PDFella
            </h2>
            <div className="space-y-3 text-xs sm:text-sm text-neutral-600 leading-relaxed">
              <p>
                Most online PDF converters require uploading confidential files to remote servers where documents are processed and temporarily stored on third-party cloud infrastructure.
              </p>
              <p>
                Modern browsers are powerful execution environments with access to WebAssembly and native memory. PDFella runs the entire PDF engine directly on your device rather than transmitting your files over the network.
              </p>
              <p className="text-neutral-800 font-medium">
                Your files never leave your computer, and when you close or reload the browser tab, all data is immediately erased from memory.
              </p>
            </div>
          </section>

          <section className="bg-white rounded-xl border border-neutral-200/80 p-6 shadow-2xs">
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 mb-4">
              Core Principles
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PRINCIPLES.map((principle) => {
                const IconComponent = principle.icon;
                return (
                  <div
                    key={principle.title}
                    className="p-4 rounded-lg bg-neutral-50/60 border border-neutral-100 flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-8 h-8 rounded-lg bg-brand-subtle text-brand-primary flex items-center justify-center mb-2.5">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-semibold text-neutral-900 mb-1">
                        {principle.title}
                      </h3>
                      <p className="text-xs text-neutral-600 leading-relaxed">
                        {principle.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="bg-white rounded-xl border border-neutral-200/80 p-6 shadow-2xs">
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 mb-2">
              Technology
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 mb-4 leading-relaxed">
              PDFella is built using modern open-source web libraries:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-lg bg-neutral-50/60 border border-neutral-100">
                <h3 className="text-xs font-bold text-neutral-900 mb-1">
                  pdf-lib
                </h3>
                <p className="text-[11px] text-neutral-600 leading-relaxed">
                  In-memory PDF binary manipulation, page tree modifications, and stream composition.
                </p>
              </div>
              <div className="p-3.5 rounded-lg bg-neutral-50/60 border border-neutral-100">
                <h3 className="text-xs font-bold text-neutral-900 mb-1">
                  PDF.js (Mozilla)
                </h3>
                <p className="text-[11px] text-neutral-600 leading-relaxed">
                  Client rendering engine rasterizing page thumbnails in isolated web workers.
                </p>
              </div>
              <div className="p-3.5 rounded-lg bg-neutral-50/60 border border-neutral-100">
                <h3 className="text-xs font-bold text-neutral-900 mb-1">
                  Next.js & React
                </h3>
                <p className="text-[11px] text-neutral-600 leading-relaxed">
                  Modern responsive interface built for keyboard navigation, touch screens, and speed.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-xl border border-neutral-200/80 p-6 shadow-2xs">
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 mb-2">
              Developer
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 mb-4 leading-relaxed">
              PDFella was designed and engineered by Tharidu Lakmal.
            </p>

            <a
              href="https://tharidulakmal.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-lg bg-neutral-50/60 border border-neutral-100 hover:border-brand-primary/40 transition-colors flex items-center justify-between group max-w-md cursor-pointer"
            >
              <div>
                <h3 className="text-xs font-bold text-neutral-900 group-hover:text-brand-primary transition-colors mb-1">
                  Tharidu Lakmal Portfolio
                </h3>
                <p className="text-[11px] text-neutral-600 leading-relaxed">
                  Engineering portfolio, open-source projects, and technical writings.
                </p>
              </div>
              <HiArrowTopRightOnSquare className="w-4 h-4 text-neutral-400 group-hover:text-brand-primary transition-colors ml-4 shrink-0" />
            </a>
          </section>
        </div>
      </main>
      <JsonLd
        toolName="About PDFella"
        toolDescription="About PDFella - 100% private PDF utility suite created by Tharidu Lakmal. Your files never leave your device."
        url="https://pdfella.tharidulakmal.com/about"
        breadcrumbs={[
          { name: "Home", item: "/" },
          { name: "About", item: "/about" },
        ]}
      />
    </AppLayout>
  );
}
