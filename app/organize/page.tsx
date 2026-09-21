import type { Metadata } from "next";
import { AppLayout } from "@/components/layout";
import { OrganizePdfView } from "@/components/features/pdf/OrganizePdfView";
import { JsonLd } from "@/components/seo";

export const metadata: Metadata = {
  title: "Organize PDF - Reorder & Rotate PDF Pages Online",
  description:
    "Reorder, rotate, and manage PDF pages in your browser. Drag-and-drop page organizer with 100% client-side security and zero server storage.",
  alternates: {
    canonical: "/organize",
  },
  openGraph: {
    title: "Organize PDF - Reorder & Rotate PDF Pages Online",
    description:
      "Reorder, rotate, and manage PDF pages in your browser. Drag-and-drop page organizer with 100% client-side security and zero server storage.",
    url: "https://pdfx.tharidulakmal.com/organize",
  },
};

export default function OrganizePage() {
  return (
    <AppLayout>
      <OrganizePdfView />
      <JsonLd
        toolName="Organize PDF"
        toolDescription="Reorder pages, rotate orientations, and manage PDF pages securely in your browser."
        url="https://pdfx.tharidulakmal.com/organize"
        breadcrumbs={[
          { name: "Home", item: "/" },
          { name: "Organize PDF", item: "/organize" },
        ]}
      />
    </AppLayout>
  );
}
