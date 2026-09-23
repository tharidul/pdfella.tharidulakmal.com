import type { Metadata } from "next";
import { AppLayout } from "@/components/layout";
import { MergePdfView } from "@/components/features/pdf/MergePdfView";
import { JsonLd } from "@/components/seo";

export const metadata: Metadata = {
  title: "PDFella — Free, Fast & 100% Private PDF Utilities",
  description:
    "All-in-one free and 100% private client-side PDF utility suite. Merge, split, compress, convert, organize, watermark, and sign PDF documents directly in your browser with zero server uploads.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "PDFella — Free PDF Tools. Private & Client-Side",
    description:
      "All-in-one free, 100% private client-side PDF utility suite. Merge, split, compress, convert, organize, watermark, and sign PDF documents directly in your browser with zero server uploads.",
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
        toolDescription="Free, fast, and 100% private client-side PDF utility suite. All PDF processing happens strictly inside your browser with zero server uploads."
        url="https://pdfella.tharidulakmal.com/"
      />
    </AppLayout>
  );
}

