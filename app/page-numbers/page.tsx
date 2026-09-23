import type { Metadata } from "next";
import { AppLayout } from "@/components/layout";
import { PageNumbersView } from "@/components/features/pdf/PageNumbersView";
import { JsonLd } from "@/components/seo";

export const metadata: Metadata = {
  title: "Add Page Numbers to PDF - Bates & Header/Footer Numbering",
  description:
    "Insert customizable page numbers into your PDF documents. Choose alignment, formats (Page X of Y, X/Y), fonts, and cover page exclusions without uploading files.",
  alternates: {
    canonical: "/page-numbers",
  },
  openGraph: {
    title: "Add Page Numbers to PDF - Bates & Header/Footer Numbering",
    description:
      "Insert customizable page numbers into your PDF documents. Choose alignment, formats (Page X of Y, X/Y), fonts, and cover page exclusions without uploading files.",
    url: "https://pdfella.tharidulakmal.com/page-numbers",
  },
};

export default function PageNumbersPage() {
  return (
    <AppLayout>
      <PageNumbersView />
      <JsonLd
        toolName="Add Page Numbers"
        toolDescription="Insert customized page numbers, Bates numbering, and headers/footers into your PDF securely in your browser."
        url="https://pdfella.tharidulakmal.com/page-numbers"
        breadcrumbs={[
          { name: "Home", item: "/" },
          { name: "Add Page Numbers", item: "/page-numbers" },
        ]}
      />
    </AppLayout>
  );
}
