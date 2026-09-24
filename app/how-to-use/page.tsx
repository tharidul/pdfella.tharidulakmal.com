import type { Metadata } from "next";
import Link from "next/link";
import { AppLayout } from "@/components/layout";
import { JsonLd } from "@/components/seo";
import {
  MergePdfIcon,
  ScissorsIcon,
  TrashIcon,
  LayersIcon,
  CompressIcon,
  ImagesToPdfIcon,
  PdfToImageIcon,
  PageNumbersIcon,
  WatermarkIcon,
  SignPdfIcon,
} from "@/components/common/icons";
import { HiArrowRight, HiLockClosed, HiSparkles } from "react-icons/hi2";
import { FaSignature } from "react-icons/fa6";

interface ToolStep {
  number: string;
  title: string;
  detail: string;
}

interface ToolHighlight {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  detail: string;
}

interface ToolGuideItem {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  steps: ToolStep[];
  highlights?: ToolHighlight[];
}

export const metadata: Metadata = {
  title: "How to Use PDFella",
  description:
    "Learn how to merge, split, remove pages, organize, compress, convert, and watermark PDF documents with PDFella.",
  alternates: {
    canonical: "/how-to-use",
  },
  openGraph: {
    title: "How to Use PDFella",
    description:
      "Step-by-step guides on how to combine, extract, prune, rotate, and compress PDF files in your browser with zero server uploads.",
    url: "https://pdfella.tharidulakmal.com/how-to-use",
    images: ["/og-image.jpg"],
  },
};

const TOOLS_GUIDE: ToolGuideItem[] = [
  {
    id: "merge",
    name: "Merge Multiple PDFs",
    description: "Combine two or more separate PDF documents into a single organized file.",
    icon: MergePdfIcon,
    href: "/merge",
    steps: [
      {
        number: "1",
        title: "Upload Your Documents",
        detail: "Drag and drop multiple PDF documents into the upload zone or click 'Select Files'.",
      },
      {
        number: "2",
        title: "Reorder File Sequence",
        detail: "Use drag handles or arrow buttons to arrange files in your desired reading order.",
      },
      {
        number: "3",
        title: "Combine & Download",
        detail: "Click 'Merge PDFs' to assemble the unified file and download it immediately.",
      },
    ],
  },
  {
    id: "split",
    name: "Split PDF & Extract Pages",
    description: "Extract specific pages or custom ranges into a new document.",
    icon: ScissorsIcon,
    href: "/split",
    steps: [
      {
        number: "1",
        title: "Upload PDF",
        detail: "Drop your PDF file into the upload zone to load page previews in memory.",
      },
      {
        number: "2",
        title: "Select Pages or Range",
        detail: "Click thumbnail cards or enter range syntax like '1-3, 5, 8-10'.",
      },
      {
        number: "3",
        title: "Extract & Save",
        detail: "Click 'Extract Pages' to compile and download your new document.",
      },
    ],
  },
  {
    id: "remove",
    name: "Remove Unwanted Pages",
    description: "Delete blank sheets, cover pages, or sensitive records before sharing.",
    icon: TrashIcon,
    href: "/remove",
    steps: [
      {
        number: "1",
        title: "Load Document",
        detail: "Select the PDF you want to prune to view all page cards.",
      },
      {
        number: "2",
        title: "Mark Pages to Delete",
        detail: "Click any page to flag it for deletion, or type page numbers in the input.",
      },
      {
        number: "3",
        title: "Generate Clean PDF",
        detail: "Click 'Remove Selected Pages' to export the clean file.",
      },
    ],
  },
  {
    id: "organize",
    name: "Organize & Rotate Pages",
    description: "Rearrange page order and rotate sideways or upside-down scans.",
    icon: LayersIcon,
    href: "/organize",
    steps: [
      {
        number: "1",
        title: "Import PDF",
        detail: "Upload your document to display each page as a draggable card.",
      },
      {
        number: "2",
        title: "Reorder & Rotate",
        detail: "Drag pages to new positions or use rotate buttons to adjust orientation.",
      },
      {
        number: "3",
        title: "Save Organized PDF",
        detail: "Click 'Save Organized PDF' to download the updated document.",
      },
    ],
  },
  {
    id: "compress",
    name: "Compress PDF File Size",
    description: "Reduce document weight for email attachments and web uploads.",
    icon: CompressIcon,
    href: "/compress",
    steps: [
      {
        number: "1",
        title: "Choose Document",
        detail: "Select the PDF file you need to shrink.",
      },
      {
        number: "2",
        title: "Select Compression Level",
        detail: "Choose between Extreme, Recommended, or Light compression presets.",
      },
      {
        number: "3",
        title: "Download Compressed PDF",
        detail: "Click 'Compress PDF' to process locally and download the optimized file.",
      },
    ],
  },
  {
    id: "image-to-pdf",
    name: "Convert Images to PDF",
    description: "Convert JPG, PNG, or WebP images into a clean PDF document.",
    icon: ImagesToPdfIcon,
    href: "/image-to-pdf",
    steps: [
      {
        number: "1",
        title: "Upload Images",
        detail: "Select multiple image files from your computer or phone.",
      },
      {
        number: "2",
        title: "Configure Page Setup",
        detail: "Set page orientation, margins, and paper size (A4, Letter, Fit).",
      },
      {
        number: "3",
        title: "Generate PDF",
        detail: "Click 'Convert to PDF' to compile all images into a single PDF.",
      },
    ],
  },
  {
    id: "pdf-to-image",
    name: "Export PDF to Images",
    description: "Extract PDF pages as individual PNG or JPG images, or download a ZIP archive.",
    icon: PdfToImageIcon,
    href: "/pdf-to-image",
    steps: [
      {
        number: "1",
        title: "Upload PDF",
        detail: "Select the document you wish to extract images from.",
      },
      {
        number: "2",
        title: "Pick Format & DPI",
        detail: "Choose PNG or JPG, select resolution, and pick which pages to export.",
      },
      {
        number: "3",
        title: "Download Images",
        detail: "Download single pages or download all selected pages as a ZIP file.",
      },
    ],
  },
  {
    id: "page-numbers",
    name: "Add Page Numbers",
    description: "Insert customizable page numbers, headers, or footers onto your PDF.",
    icon: PageNumbersIcon,
    href: "/page-numbers",
    steps: [
      {
        number: "1",
        title: "Upload PDF",
        detail: "Select the document needing page numbering.",
      },
      {
        number: "2",
        title: "Choose Style & Position",
        detail: "Set placement (top, bottom, center, corners), format, font size, and color.",
      },
      {
        number: "3",
        title: "Apply & Download",
        detail: "Click 'Add Page Numbers' to render numbering directly onto each page.",
      },
    ],
  },
  {
    id: "watermark",
    name: "Add Watermark",
    description: "Stamp text or logo watermarks across PDF pages with opacity control.",
    icon: WatermarkIcon,
    href: "/watermark",
    steps: [
      {
        number: "1",
        title: "Upload PDF",
        detail: "Select the file you want to protect or brand.",
      },
      {
        number: "2",
        title: "Customize Watermark",
        detail: "Enter text or upload a transparent PNG logo, adjust angle, scale, and opacity.",
      },
      {
        number: "3",
        title: "Stamp & Download",
        detail: "Click 'Apply Watermark' to embed the mark across all pages.",
      },
    ],
  },
  {
    id: "sign",
    name: "Sign PDF Documents",
    description: "Draw, type, or upload custom e-signatures and place them on any page.",
    icon: SignPdfIcon,
    href: "/sign",
    steps: [
      {
        number: "1",
        title: "Load Document",
        detail: "Select or drop your PDF document to render high-resolution page previews.",
      },
      {
        number: "2",
        title: "Create Signature",
        detail: "Draw smoothly with pen width/color, type in elegant script fonts, or upload a scan.",
      },
      {
        number: "3",
        title: "Place, Resize & Sign",
        detail: "Drag signature onto any page, resize with handles, and download your signed PDF.",
      },
    ],
    highlights: [
      {
        icon: HiLockClosed,
        title: "Zero Server Uploads",
        detail: "Your contracts stay strictly on your computer. 100% private and confidential.",
      },
      {
        icon: FaSignature,
        title: "Draw, Type, or Upload",
        detail: "Handwrite with touch or mouse, choose cursive handwriting, or upload signature images.",
      },
      {
        icon: HiSparkles,
        title: "Precision Placement",
        detail: "Drag, scale, and snap onto any line across any page with live zoom controls.",
      },
    ],
  },
];

export default function HowToUsePage() {
  return (
    <AppLayout>
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-12 flex flex-col">
        <div className="flex flex-col mb-10 text-left">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
            How to Use PDFella
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 mt-2 max-w-2xl leading-relaxed">
            Step-by-step instructions for all PDF utilities. Everything runs locally on your device with zero server uploads.
          </p>
        </div>

        <div className="flex flex-col space-y-6 sm:space-y-8">
          {TOOLS_GUIDE.map((tool) => {
            const Icon = tool.icon;
            return (
              <section
                key={tool.id}
                id={tool.id}
                className="scroll-mt-24 p-6 sm:p-7 rounded-xl border border-neutral-200/80 bg-white shadow-2xs flex flex-col"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-100 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-brand-subtle text-brand-primary flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-neutral-900">
                        {tool.name}
                      </h2>
                      <p className="text-xs text-neutral-600 mt-0.5">
                        {tool.description}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={tool.href}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-semibold transition-colors shrink-0 shadow-2xs cursor-pointer min-h-[36px]"
                  >
                    <span>Open Tool</span>
                    <HiArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {tool.steps.map((step) => (
                    <div
                      key={step.number}
                      className="p-3.5 rounded-lg bg-neutral-50/70 border border-neutral-100 flex flex-col justify-between"
                    >
                      <div>
                        <span className="text-xs font-bold text-brand-primary mb-1 block">
                          Step {step.number}
                        </span>
                        <h3 className="text-sm font-semibold text-neutral-900 mb-1">
                          {step.title}
                        </h3>
                        <p className="text-xs text-neutral-600 leading-relaxed">
                          {step.detail}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {tool.highlights && tool.highlights.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-4 pt-4 border-t border-neutral-100">
                    {tool.highlights.map((highlight) => {
                      const HighlightIcon = highlight.icon;
                      return (
                        <div
                          key={highlight.title}
                          className="p-3.5 rounded-xl border border-neutral-200/80 bg-neutral-50/50 shadow-2xs flex flex-col"
                        >
                          <div className="w-8 h-8 rounded-lg bg-brand-subtle text-brand-primary flex items-center justify-center mb-2.5">
                            <HighlightIcon className="w-4 h-4" />
                          </div>
                          <h4 className="text-xs font-bold text-neutral-800">
                            {highlight.title}
                          </h4>
                          <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                            {highlight.detail}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>
      <JsonLd
        toolName="How to Use PDFella"
        toolDescription="Complete guide to using PDFella utilities securely on your device."
        url="https://pdfella.tharidulakmal.com/how-to-use"
        breadcrumbs={[
          { name: "Home", item: "/" },
          { name: "How to Use", item: "/how-to-use" },
        ]}
      />
    </AppLayout>
  );
}
