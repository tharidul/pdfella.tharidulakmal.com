import type { Metadata } from "next";
import { AppLayout } from "@/components/layout";
import { RemovePagesView } from "@/components/features/pdf/RemovePagesView";
import { JsonLd } from "@/components/seo";

export const metadata: Metadata = {
  title: "Remove PDF Pages - Delete Unwanted Pages Online Free",
  description:
    "Quickly delete unwanted or sensitive pages from any PDF document. 100% browser-based with zero file uploads and instant download.",
  alternates: {
    canonical: "/remove",
  },
  openGraph: {
    title: "Remove PDF Pages - Delete Unwanted Pages Online Free",
    description:
      "Quickly delete unwanted or sensitive pages from any PDF document. 100% browser-based with zero file uploads and instant download.",
    url: "https://pdfx.tharidulakmal.com/remove",
  },
};

export default function RemovePage() {
  return (
    <AppLayout>
      <RemovePagesView />
      <JsonLd
        toolName="Remove PDF Pages"
        toolDescription="Delete unwanted or sensitive pages from your PDF file securely in your browser."
        url="https://pdfx.tharidulakmal.com/remove"
        breadcrumbs={[
          { name: "Home", item: "/" },
          { name: "Remove Pages", item: "/remove" },
        ]}
      />
    </AppLayout>
  );
}
