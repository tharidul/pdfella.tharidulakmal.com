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

export interface NavItem {
  id: string;
  name: string;
  description: string;
  icon: typeof MergePdfIcon;
  href: string;
}

export const PRIMARY_TOOLS: NavItem[] = [
  {
    id: "merge",
    name: "Merge PDFs",
    description: "Combine multiple PDFs",
    icon: MergePdfIcon,
    href: "/",
  },
  {
    id: "split",
    name: "Split PDF",
    description: "Extract pages & ranges",
    icon: ScissorsIcon,
    href: "/split",
  },
  {
    id: "remove",
    name: "Remove Pages",
    description: "Delete unwanted pages",
    icon: TrashIcon,
    href: "/remove",
  },
  {
    id: "organize",
    name: "Organize PDF",
    description: "Reorder, rotate & manage",
    icon: LayersIcon,
    href: "/organize",
  },
  {
    id: "compress",
    name: "Compress PDF",
    description: "Reduce file size",
    icon: CompressIcon,
    href: "/compress",
  },
  {
    id: "image-to-pdf",
    name: "Images to PDF",
    description: "Convert JPG/PNG to PDF",
    icon: ImagesToPdfIcon,
    href: "/image-to-pdf",
  },
  {
    id: "pdf-to-image",
    name: "PDF to Images",
    description: "Export PNG/JPG or ZIP",
    icon: PdfToImageIcon,
    href: "/pdf-to-image",
  },
  {
    id: "page-numbers",
    name: "Page Numbers",
    description: "Add headers & numbering",
    icon: PageNumbersIcon,
    href: "/page-numbers",
  },
  {
    id: "watermark",
    name: "Watermark PDF",
    description: "Stamp text or logo",
    icon: WatermarkIcon,
    href: "/watermark",
  },
  {
    id: "sign",
    name: "Sign PDF",
    description: "Add e-signatures & stamps",
    icon: SignPdfIcon,
    href: "/sign",
  },
];

export const RESOURCE_LINKS = [
  { href: "/how-to-use", label: "How to Use" },
  { href: "/faq", label: "Frequently Asked Questions (FAQ)" },
  { href: "/about", label: "About PDF-X" },
];
