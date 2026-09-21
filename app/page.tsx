import type { Metadata } from "next";
import { AppLayout, Footer } from "@/components/layout";
import { MergePdfView } from "@/components/features";
import { JsonLd, ToolInfoSection, type FaqItem, type StepItem } from "@/components/seo";

export const metadata: Metadata = {
  title: "Merge PDF - Combine Multiple PDF Files Online Free",
  description:
    "Merge multiple PDF files into one document directly in your browser. Fast, 100% private client-side processing with custom document reordering.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Merge PDF - Combine Multiple PDF Files Online Free | PDF-X",
    description:
      "Merge multiple PDF files into a single document directly in your browser. 100% private client-side processing with zero server uploads.",
    url: "https://pdfx.tharidulakmal.com/",
  },
};

const MERGE_STEPS: StepItem[] = [
  {
    number: "1",
    title: "Add PDF Documents",
    description:
      "Select or drag & drop two or more PDF files into the upload zone. Documents load instantly without uploading to any remote server.",
  },
  {
    number: "2",
    title: "Arrange Order",
    description:
      "Drag file cards or use directional arrow buttons to organize files into your preferred page sequence with real-time thumbnail previews.",
  },
  {
    number: "3",
    title: "Merge & Save",
    description:
      "Click Merge PDFs to combine all documents into a single unified file. Your new PDF downloads immediately to your computer or phone.",
  },
];

const MERGE_FAQS: FaqItem[] = [
  {
    question: "Are my files uploaded to any external server?",
    answer:
      "No. All PDF merging happens 100% locally inside your browser using client-side WebAssembly and JavaScript. Your confidential files never touch external servers or cloud storage.",
  },
  {
    question: "Is there a limit on how many PDFs I can combine?",
    answer:
      "No. There are no artificial limits, paywalls, or daily caps. You can merge as many documents as your device's browser memory permits.",
  },
  {
    question: "Will the original quality of text and images be preserved?",
    answer:
      "Yes. PDF-X performs lossless page concatenation. Vector illustrations, embedded fonts, and high-resolution images are preserved in their original fidelity.",
  },
  {
    question: "Can I merge PDFs offline?",
    answer:
      "Yes. Once the web application is loaded in your browser, you can disconnect from Wi-Fi or mobile data and continue merging PDFs securely.",
  },
];

export default function Home() {
  return (
    <AppLayout>
      <MergePdfView />
      <ToolInfoSection
        toolName="PDF Merger"
        actionWord="merge PDFs"
        steps={MERGE_STEPS}
        faqs={MERGE_FAQS}
        currentRoute="/"
      />
      <Footer />
      <JsonLd
        toolName="Merge PDF"
        toolDescription="Combine multiple PDF documents into a single unified file securely in your browser."
        url="https://pdfx.tharidulakmal.com/"
        faqs={MERGE_FAQS}
      />
    </AppLayout>
  );
}
