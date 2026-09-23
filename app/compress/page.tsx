import type { Metadata } from "next";
import { AppLayout } from "@/components/layout";
import { CompressPdfView } from "@/components/features/pdf/CompressPdfView";
import { JsonLd } from "@/components/seo";

export const metadata: Metadata = {
  title: "Compress PDF - Reduce PDF File Size Online Free",
  description:
    "Shrink PDF file sizes while preserving visual clarity. Free, 100% private client-side compression without uploading documents to external servers.",
  alternates: {
    canonical: "/compress",
  },
  openGraph: {
    title: "Compress PDF - Reduce PDF File Size Online Free",
    description:
      "Shrink PDF file sizes while preserving visual clarity. Free, 100% private client-side compression without uploading documents to external servers.",
    url: "https://pdfella.tharidulakmal.com/compress",
    images: ["/og-image.jpg"],
  },
};

export default function CompressPage() {
  return (
    <AppLayout>
      <CompressPdfView />
      <JsonLd
        toolName="Compress PDF"
        toolDescription="Reduce PDF file size while preserving visual quality securely in your browser."
        url="https://pdfella.tharidulakmal.com/compress"
        breadcrumbs={[
          { name: "Home", item: "/" },
          { name: "Compress PDF", item: "/compress" },
        ]}
      />
    </AppLayout>
  );
}
