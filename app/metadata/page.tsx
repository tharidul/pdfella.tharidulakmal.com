import type { Metadata } from "next";
import { AppLayout } from "@/components/layout";
import { MetadataPdfView } from "@/components/features/pdf/MetadataPdfView";
import { JsonLd } from "@/components/seo";

export const metadata: Metadata = {
  title: "Edit PDF Metadata - PDFella",
  description:
    "View, edit, or remove PDF properties including Title, Author, Subject, Keywords, and software metadata directly in your browser.",
  alternates: {
    canonical: "/metadata",
  },
  openGraph: {
    title: "Edit PDF Metadata - PDFella",
    description:
      "View, edit, or remove PDF properties including Title, Author, Subject, Keywords, and software metadata directly in your browser.",
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
        toolDescription="Inspect, edit, or remove PDF document properties, author tags, and software metadata directly in your browser without uploading files."
        url="https://pdfella.tharidulakmal.com/metadata"
        breadcrumbs={[
          { name: "Home", item: "/" },
          { name: "Edit PDF Metadata", item: "/metadata" },
        ]}
      />
    </AppLayout>
  );
}
