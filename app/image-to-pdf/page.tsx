import type { Metadata } from "next";
import { AppLayout } from "@/components/layout";
import { ImageToPdfView } from "@/components/features/pdf/ImageToPdfView";
import { JsonLd } from "@/components/seo";

export const metadata: Metadata = {
  title: "Images to PDF - Convert JPG, PNG & WebP to PDF Online",
  description:
    "Convert JPG, PNG, and WebP images to a standardized PDF document. Free, 100% private, zero-server uploads, with custom page sizes, orientations, and margins.",
  alternates: {
    canonical: "/image-to-pdf",
  },
  openGraph: {
    title: "Images to PDF - Convert JPG, PNG & WebP to PDF Online",
    description:
      "Convert JPG, PNG, and WebP images to a standardized PDF document. Free, 100% private, zero-server uploads, with custom page sizes, orientations, and margins.",
    url: "https://pdfella.tharidulakmal.com/image-to-pdf",
    images: ["/og-image.jpg"],
  },
};

export default function ImageToPdfPage() {
  return (
    <AppLayout>
      <ImageToPdfView />
      <JsonLd
        toolName="Images to PDF"
        toolDescription="Convert multiple images (JPG, PNG, WebP) into a single organized PDF document securely in your browser."
        url="https://pdfella.tharidulakmal.com/image-to-pdf"
        breadcrumbs={[
          { name: "Home", item: "/" },
          { name: "Images to PDF", item: "/image-to-pdf" },
        ]}
      />
    </AppLayout>
  );
}
