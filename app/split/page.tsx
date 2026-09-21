import type { Metadata } from "next";
import { AppLayout } from "@/components/layout";
import { SplitPdfView } from "@/components/features";
import { JsonLd } from "@/components/seo";

export const metadata: Metadata = {
  title: "Split PDF - Extract Pages & Custom Ranges Online",
  description:
    "Extract individual pages or custom page ranges from your PDF instantly. Free, client-side, and completely private with visual page selection.",
  alternates: {
    canonical: "/split",
  },
  openGraph: {
    title: "Split PDF - Extract Pages & Custom Ranges Online",
    description:
      "Extract individual pages or custom page ranges from your PDF instantly. Free, client-side, and completely private with visual page selection.",
    url: "https://pdfx.tharidulakmal.com/split",
  },
};

export default function SplitPage() {
  return (
    <AppLayout>
      <SplitPdfView />
      <JsonLd
        toolName="Split PDF"
        toolDescription="Extract specific pages or custom page ranges from your PDF document securely in your browser."
        url="https://pdfx.tharidulakmal.com/split"
        breadcrumbs={[
          { name: "Home", item: "/" },
          { name: "Split PDF", item: "/split" },
        ]}
      />
    </AppLayout>
  );
}
