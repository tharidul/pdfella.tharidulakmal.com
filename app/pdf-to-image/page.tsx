import type { Metadata } from "next";
import { AppLayout } from "@/components/layout";
import { PdfToImageView } from "@/components/features/pdf/PdfToImageView";
import { JsonLd } from "@/components/seo";

export const metadata: Metadata = {
  title: "PDF to Images - Extract High-Resolution JPG & PNG Online",
  description:
    "Convert PDF pages into high-resolution PNG or JPG images. Download pages individually or package them all in a single ZIP file. 100% private and client-side.",
  alternates: {
    canonical: "/pdf-to-image",
  },
  openGraph: {
    title: "PDF to Images - Extract High-Resolution JPG & PNG Online",
    description:
      "Convert PDF pages into high-resolution PNG or JPG images. Download pages individually or package them all in a single ZIP file. 100% private and client-side.",
    url: "https://pdfx.tharidulakmal.com/pdf-to-image",
  },
};

export default function PdfToImagePage() {
  return (
    <AppLayout>
      <PdfToImageView />
      <JsonLd
        toolName="PDF to Images"
        toolDescription="Convert PDF pages into crisp PNG or JPEG images and download individually or in a ZIP file directly in your browser."
        url="https://pdfx.tharidulakmal.com/pdf-to-image"
        breadcrumbs={[
          { name: "Home", item: "/" },
          { name: "PDF to Images", item: "/pdf-to-image" },
        ]}
      />
    </AppLayout>
  );
}
