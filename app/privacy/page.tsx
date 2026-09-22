import type { Metadata } from "next";
import { AppLayout } from "@/components/layout";
import { JsonLd } from "@/components/seo";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Technical privacy disclosure detailing how PDF-X processes documents strictly client-side with zero server uploads, no cookies, and zero logging.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Privacy Policy",
    description:
      "Understand how PDF-X protects your sensitive documents: 100% browser-based processing, zero server storage, and no tracking cookies.",
    url: "https://pdfx.tharidulakmal.com/privacy",
  },
};

const POLICIES = [
  {
    title: "Zero Server Uploads",
    description:
      "Your documents never leave your device. All file processing runs entirely in your browser memory using WebAssembly and JavaScript.",
  },
  {
    title: "Zero Document Storage & Logging",
    description:
      "Because files are never transmitted to our infrastructure, we do not store, view, or log your document contents, file names, or metadata.",
  },
  {
    title: "Ephemeral In-Memory Processing",
    description:
      "Documents exist only in temporary browser memory buffers while the tab is open. Closing or reloading the tab immediately wipes all data.",
  },
  {
    title: "No Tracking Cookies",
    description:
      "PDF-X does not use advertising cookies, keystroke recorders, or cross-site tracking scripts. Your work remains completely private.",
  },
];

export default function PrivacyPage() {
  return (
    <AppLayout>
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-10 text-left">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 mt-2 leading-relaxed">
            PDF-X is designed with a strict client-side architecture. Documents are processed locally in your browser and are never uploaded to any remote server.
          </p>
        </div>

        <div className="space-y-6">
          <section className="bg-white rounded-xl border border-neutral-200/80 p-6 shadow-2xs">
            <h2 className="text-base font-bold text-neutral-900 mb-4">
              Core Privacy Guarantees
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {POLICIES.map((item) => (
                <div
                  key={item.title}
                  className="p-4 rounded-lg bg-neutral-50/60 border border-neutral-100"
                >
                  <h3 className="text-sm font-semibold text-neutral-900 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-xl border border-neutral-200/80 p-6 shadow-2xs space-y-3">
            <h2 className="text-base font-bold text-neutral-900">
              Confidentiality & Compliance
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              Because files are processed exclusively on your device, using PDF-X is functionally equivalent to using offline desktop software. It does not transmit document contents over the network, making it safe for files subject to NDAs, privacy regulations, or confidential workflows.
            </p>
          </section>

          <section className="bg-white rounded-xl border border-neutral-200/80 p-6 shadow-2xs space-y-3">
            <h2 className="text-base font-bold text-neutral-900">
              Questions & Verification
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              You can verify zero-upload execution by inspecting your browser network tab during any operation. If you have questions about our privacy practices, contact{" "}
              <a
                href="https://tharidulakmal.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-primary font-medium underline cursor-pointer"
              >
                Tharidu Lakmal
              </a>
              .
            </p>
          </section>
        </div>
      </main>
      <JsonLd
        toolName="Privacy Policy"
        toolDescription="PDF-X client-side privacy policy. Zero server uploads, no cookies, zero data logging."
        url="https://pdfx.tharidulakmal.com/privacy"
        breadcrumbs={[
          { name: "Home", item: "/" },
          { name: "Privacy Policy", item: "/privacy" },
        ]}
      />
    </AppLayout>
  );
}
