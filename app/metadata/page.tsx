import type { Metadata } from "next";
import { AppLayout } from "@/components/layout";
import { MetadataPdfView } from "@/components/features/pdf/MetadataPdfView";
import { JsonLd } from "@/components/seo";

export const metadata: Metadata = {
  title: "Edit PDF Metadata & Remove Tracking Info - 100% Private | PDFella",
  description:
    "View and edit PDF properties including Title, Author, Subject, and Keywords, or sanitize hidden software and tracking metadata with one click. 100% private with zero server uploads.",
  alternates: {
    canonical: "/metadata",
  },
  openGraph: {
    title: "Edit PDF Metadata & Remove Tracking Info - 100% Private | PDFella",
    description:
      "View and edit PDF properties including Title, Author, Subject, and Keywords, or sanitize hidden software and tracking metadata with one click. 100% private with zero server uploads.",
    url: "https://pdfella.tharidulakmal.com/metadata",
    images: ["/og-image.jpg"],
  },
};

export default function MetadataPage() {
  return (
    <AppLayout>
      <MetadataPdfView />
      <JsonLd
        toolName="Edit PDF Metadata"
        toolDescription="Inspect, edit, or sanitize PDF document properties, author tags, and software metadata directly in your browser with zero server uploads."
        url="https://pdfella.tharidulakmal.com/metadata"
        breadcrumbs={[
          { name: "Home", item: "/" },
          { name: "Edit PDF Metadata", item: "/metadata" },
        ]}
      />
    </AppLayout>
  );
}
