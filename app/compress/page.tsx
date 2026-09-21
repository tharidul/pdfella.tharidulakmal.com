import type { Metadata } from "next";
import { AppLayout, Footer } from "@/components/layout";
import { CompressPdfView } from "@/components/features";
import { JsonLd, ToolInfoSection, type FaqItem, type StepItem } from "@/components/seo";

export const metadata: Metadata = {
  title: "Compress PDF - Reduce PDF File Size Online Free",
  description:
    "Shrink PDF file sizes while preserving visual clarity. Free, 100% private client-side compression without uploading documents to external servers.",
  alternates: {
    canonical: "/compress",
  },
  openGraph: {
    title: "Compress PDF - Reduce PDF File Size Online Free | PDF-X",
    description:
      "Shrink PDF file sizes while preserving visual clarity. Free, 100% private client-side compression without uploading documents to external servers.",
    url: "https://pdfx.tharidulakmal.com/compress",
  },
};

const COMPRESS_STEPS: StepItem[] = [
  {
    number: "1",
    title: "Upload Document",
    description:
      "Select or drag & drop the PDF file you want to reduce. The document is analyzed instantly within local browser memory.",
  },
  {
    number: "2",
    title: "Choose Compression Mode",
    description:
      "Select your preferred balance between file size and visual fidelity (Extreme, Recommended, or Light compression).",
  },
  {
    number: "3",
    title: "Compress & Download",
    description:
      "Click Compress PDF to streamline document structures and download the smaller file immediately with verified size savings.",
  },
];

const COMPRESS_FAQS: FaqItem[] = [
  {
    question: "How does client-side PDF compression work?",
    answer:
      "PDF-X optimizes internal document stream structures, removes unneeded metadata, and downsizes oversized raster graphics directly inside your browser memory.",
  },
  {
    question: "Will compressing my PDF make the text look blurry?",
    answer:
      "No. Vector text outlines, fonts, and line drawings remain crisp and scalable. Only raster image assets are re-sampled according to your chosen compression preset.",
  },
  {
    question: "Are my files uploaded to any third-party server?",
    answer:
      "Zero server uploads. All compression algorithms execute strictly on your device, ensuring sensitive documents remain completely private.",
  },
  {
    question: "Is there a limit on how many files I can compress?",
    answer:
      "There are no daily quotas, subscriptions, or limits. You can compress as many files as you need, completely free of charge.",
  },
];

export default function CompressPage() {
  return (
    <AppLayout>
      <CompressPdfView />
      <ToolInfoSection
        toolName="PDF Compressor"
        actionWord="compress PDF files"
        steps={COMPRESS_STEPS}
        faqs={COMPRESS_FAQS}
        currentRoute="/compress"
      />
      <Footer />
      <JsonLd
        toolName="Compress PDF"
        toolDescription="Reduce PDF file size while preserving visual quality securely in your browser."
        url="https://pdfx.tharidulakmal.com/compress"
        breadcrumbs={[
          { name: "Home", item: "/" },
          { name: "Compress PDF", item: "/compress" },
        ]}
        faqs={COMPRESS_FAQS}
      />
    </AppLayout>
  );
}
