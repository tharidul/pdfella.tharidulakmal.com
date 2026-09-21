import type { Metadata } from "next";
import { AppLayout } from "@/components/layout";
import { WatermarkPdfView } from "@/components/features/pdf/WatermarkPdfView";
import { JsonLd } from "@/components/seo";

export const metadata: Metadata = {
  title: "Watermark PDF - Add Confidential Stamps & Image Logos Online",
  description:
    "Add customizable text watermarks or logo stamps to your PDF documents. Set rotation, opacity, font size, and color with real-time preview. 100% private and client-side.",
  alternates: {
    canonical: "/watermark",
  },
  openGraph: {
    title: "Watermark PDF - Add Confidential Stamps & Image Logos Online",
    description:
      "Add customizable text watermarks or logo stamps to your PDF documents. Set rotation, opacity, font size, and color with real-time preview. 100% private and client-side.",
    url: "https://pdfx.tharidulakmal.com/watermark",
  },
};

export default function WatermarkPage() {
  return (
    <AppLayout>
      <WatermarkPdfView />
      <JsonLd
        toolName="Watermark PDF"
        toolDescription="Add text stamps or image logo watermarks to PDF pages with rotation and opacity control entirely in your browser."
        url="https://pdfx.tharidulakmal.com/watermark"
        breadcrumbs={[
          { name: "Home", item: "/" },
          { name: "Watermark PDF", item: "/watermark" },
        ]}
      />
    </AppLayout>
  );
}
