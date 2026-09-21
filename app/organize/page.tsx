import type { Metadata } from "next";
import { AppLayout, Footer } from "@/components/layout";
import { OrganizePdfView } from "@/components/features";
import { JsonLd, ToolInfoSection, type FaqItem, type StepItem } from "@/components/seo";

export const metadata: Metadata = {
  title: "Organize PDF - Reorder & Rotate PDF Pages Online",
  description:
    "Reorder, rotate, and manage PDF pages in your browser. Drag-and-drop page organizer with 100% client-side security and zero server storage.",
  alternates: {
    canonical: "/organize",
  },
  openGraph: {
    title: "Organize PDF - Reorder & Rotate PDF Pages Online | PDF-X",
    description:
      "Reorder, rotate, and manage PDF pages in your browser. Drag-and-drop page organizer with 100% client-side security and zero server storage.",
    url: "https://pdfx.tharidulakmal.com/organize",
  },
};

const ORGANIZE_STEPS: StepItem[] = [
  {
    number: "1",
    title: "Upload PDF File",
    description:
      "Drop or select the PDF document you wish to reorganize. Every page renders as an interactive thumbnail card.",
  },
  {
    number: "2",
    title: "Reorder & Rotate",
    description:
      "Drag pages to rearrange their sequence, rotate orientation clockwise or counter-clockwise, or delete pages on the fly.",
  },
  {
    number: "3",
    title: "Export Reorganized PDF",
    description:
      "Download your reorganized document instantly. All orientation and order adjustments are saved cleanly without recompression loss.",
  },
];

const ORGANIZE_FAQS: FaqItem[] = [
  {
    question: "Can I rotate specific pages without affecting the rest of the document?",
    answer:
      "Yes. Each page card features independent rotation controls allowing you to rotate individual pages in 90-degree increments.",
  },
  {
    question: "How does page reordering work?",
    answer:
      "Simply drag and drop any page thumbnail to its desired position in the visual layout grid. Order updates immediately.",
  },
  {
    question: "Are my documents kept secure and private?",
    answer:
      "Yes. PDF-X operates 100% client-side. No files are transferred to external cloud servers, ensuring strict privacy.",
  },
  {
    question: "Can I delete specific pages while reorganizing?",
    answer:
      "Yes. You can delete unwanted pages directly from the organizer view while arranging the remaining pages in one workflow.",
  },
];

export default function OrganizePage() {
  return (
    <AppLayout>
      <OrganizePdfView />
      <ToolInfoSection
        toolName="PDF Organizer"
        actionWord="organize PDF pages"
        steps={ORGANIZE_STEPS}
        faqs={ORGANIZE_FAQS}
        currentRoute="/organize"
      />
      <Footer />
      <JsonLd
        toolName="Organize PDF"
        toolDescription="Reorder pages, rotate orientations, and manage PDF pages securely in your browser."
        url="https://pdfx.tharidulakmal.com/organize"
        breadcrumbs={[
          { name: "Home", item: "/" },
          { name: "Organize PDF", item: "/organize" },
        ]}
        faqs={ORGANIZE_FAQS}
      />
    </AppLayout>
  );
}
