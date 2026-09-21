import type { Metadata } from "next";
import { AppLayout, Footer } from "@/components/layout";
import { SplitPdfView } from "@/components/features";
import { JsonLd, ToolInfoSection, type FaqItem, type StepItem } from "@/components/seo";

export const metadata: Metadata = {
  title: "Split PDF - Extract Pages & Custom Ranges Online",
  description:
    "Extract individual pages or custom page ranges from your PDF instantly. Free, client-side, and completely private with visual page selection.",
  alternates: {
    canonical: "/split",
  },
  openGraph: {
    title: "Split PDF - Extract Pages & Custom Ranges Online | PDF-X",
    description:
      "Extract individual pages or custom page ranges from your PDF instantly. Free, client-side, and completely private with visual page selection.",
    url: "https://pdfx.tharidulakmal.com/split",
  },
};

const SPLIT_STEPS: StepItem[] = [
  {
    number: "1",
    title: "Upload PDF File",
    description:
      "Drag and drop or browse to select your PDF document. The file opens locally in your browser with zero upload lag.",
  },
  {
    number: "2",
    title: "Choose Pages or Ranges",
    description:
      "Click visual page thumbnails or enter syntax like 1-3, 5, 8-12. Live two-way synchronization highlights selections instantly.",
  },
  {
    number: "3",
    title: "Extract & Download",
    description:
      "Click Split PDF to assemble the selected pages into a new document and download it instantly to your device.",
  },
];

const SPLIT_FAQS: FaqItem[] = [
  {
    question: "How do I specify complex page ranges?",
    answer:
      "You can enter single pages and ranges separated by commas, such as 1-4, 7, 9-12. The tool automatically validates ranges against your document's total page count.",
  },
  {
    question: "Does splitting a PDF reduce its visual clarity?",
    answer:
      "No. Page extraction is lossless; vector elements, embedded fonts, and source images retain their original quality and metadata.",
  },
  {
    question: "Are my confidential documents uploaded to any server?",
    answer:
      "Never. All extraction operations occur entirely inside your browser's local sandbox. No data is transmitted across the internet.",
  },
  {
    question: "Can I split password-protected or encrypted PDFs?",
    answer:
      "You will need to ensure the document is unlocked before splitting, as the browser-based engine respects document permission security.",
  },
];

export default function SplitPage() {
  return (
    <AppLayout>
      <SplitPdfView />
      <ToolInfoSection
        toolName="PDF Splitter"
        actionWord="split PDF pages"
        steps={SPLIT_STEPS}
        faqs={SPLIT_FAQS}
        currentRoute="/split"
      />
      <Footer />
      <JsonLd
        toolName="Split PDF"
        toolDescription="Extract specific pages or custom page ranges from your PDF document securely in your browser."
        url="https://pdfx.tharidulakmal.com/split"
        breadcrumbs={[
          { name: "Home", item: "/" },
          { name: "Split PDF", item: "/split" },
        ]}
        faqs={SPLIT_FAQS}
      />
    </AppLayout>
  );
}
