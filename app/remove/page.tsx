import type { Metadata } from "next";
import { AppLayout, Footer } from "@/components/layout";
import { RemovePagesView } from "@/components/features";
import { JsonLd, ToolInfoSection, type FaqItem, type StepItem } from "@/components/seo";

export const metadata: Metadata = {
  title: "Remove PDF Pages - Delete Unwanted Pages Online Free",
  description:
    "Quickly delete unwanted or sensitive pages from any PDF document. 100% browser-based with zero file uploads and instant download.",
  alternates: {
    canonical: "/remove",
  },
  openGraph: {
    title: "Remove PDF Pages - Delete Unwanted Pages Online Free | PDF-X",
    description:
      "Quickly delete unwanted or sensitive pages from any PDF document. 100% browser-based with zero file uploads and instant download.",
    url: "https://pdfx.tharidulakmal.com/remove",
  },
};

const REMOVE_STEPS: StepItem[] = [
  {
    number: "1",
    title: "Upload Document",
    description:
      "Drop or select the PDF document you want to edit. Pages render directly within your browser's private memory.",
  },
  {
    number: "2",
    title: "Flag Pages to Delete",
    description:
      "Click on pages to mark them with danger badges or type page numbers and ranges (e.g. 2, 4-6) to delete.",
  },
  {
    number: "3",
    title: "Prune & Save",
    description:
      "Click Remove Pages to generate a pruned PDF file containing only your retained pages, downloaded immediately.",
  },
];

const REMOVE_FAQS: FaqItem[] = [
  {
    question: "Can I accidentally delete all pages from a PDF?",
    answer:
      "No. PDF-X features safety guardrails that prevent deleting all pages, ensuring at least one valid page remains in the final document.",
  },
  {
    question: "Are removed pages permanently purged from the output file?",
    answer:
      "Yes. The output document is rebuilt from scratch with only the selected pages. Deleted content is not recoverable from the resulting PDF.",
  },
  {
    question: "Are my confidential files uploaded or saved anywhere?",
    answer:
      "Never. All page removal happens 100% locally on your computer or phone. No documents, metadata, or logs ever leave your device.",
  },
  {
    question: "Does removing pages change page layout or font styling?",
    answer:
      "No. Retained pages maintain exact layout geometry, embedded typography, vector shapes, and image resolutions without degradation.",
  },
];

export default function RemovePage() {
  return (
    <AppLayout>
      <RemovePagesView />
      <ToolInfoSection
        toolName="PDF Page Remover"
        actionWord="remove PDF pages"
        steps={REMOVE_STEPS}
        faqs={REMOVE_FAQS}
        currentRoute="/remove"
      />
      <Footer />
      <JsonLd
        toolName="Remove PDF Pages"
        toolDescription="Delete unwanted or sensitive pages from your PDF file securely in your browser."
        url="https://pdfx.tharidulakmal.com/remove"
        breadcrumbs={[
          { name: "Home", item: "/" },
          { name: "Remove Pages", item: "/remove" },
        ]}
        faqs={REMOVE_FAQS}
      />
    </AppLayout>
  );
}
