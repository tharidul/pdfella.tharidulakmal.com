import type { Metadata } from "next";
import { AppLayout } from "@/components/layout";
import { MergePdfView } from "@/components/features/pdf/MergePdfView";
import { JsonLd } from "@/components/seo";

export const metadata: Metadata = {
  title: "Merge PDF - Combine Multiple PDF Files Online Free",
  description:
    "Merge multiple PDF files into one document directly in your browser. Fast, 100% private client-side processing with custom document reordering.",
  alternates: {
    canonical: "/merge",
  },
  openGraph: {
    title: "Merge PDF - Combine Multiple PDF Files Online Free",
    description:
      "Merge multiple PDF files into a single document directly in your browser. 100% private client-side processing with zero server uploads.",
    url: "https://pdfella.tharidulakmal.com/merge",
    images: ["/og-image.jpg"],
  },
};

export default function MergePage() {
  return (
    <AppLayout>
      <MergePdfView />
      <JsonLd
        toolName="Merge PDF"
        toolDescription="Combine multiple PDF documents into a single unified file securely in your browser."
        url="https://pdfella.tharidulakmal.com/merge"
      />
    </AppLayout>
  );
}
