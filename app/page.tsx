import type { Metadata } from "next";
import { AppLayout } from "@/components/layout";
import { MergePdfView } from "@/components/features/pdf/MergePdfView";
import { JsonLd } from "@/components/seo";

export const metadata: Metadata = {
  title: "PDFella: Free, Fast & 100% Private PDF Tools",
  description:
    "Your files never leave your device. Free, 100% private PDF tools to merge, split, compress, convert, organize, watermark, and sign documents directly in your browser with zero server uploads.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "PDFella: Free & 100% Private PDF Tools",
    description:
      "Your files never leave your device. Free, 100% private PDF tools to merge, split, compress, convert, organize, and sign documents with zero server uploads.",
    url: "https://pdfella.tharidulakmal.com/",
    images: ["/og-image.jpg"],
  },
};

export default function Home() {
  return (
    <AppLayout>
      <MergePdfView />
      <JsonLd
        toolName="PDF Utilities Suite"
        toolDescription="Free, fast, and 100% private PDF tools. All processing happens directly on your device with zero server uploads."
        url="https://pdfella.tharidulakmal.com/"
      />
    </AppLayout>
  );
}

