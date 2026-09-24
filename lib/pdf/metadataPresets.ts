export interface MetadataOption {
  label: string;
  value: string;
  category: "Microsoft" | "Adobe" | "Apple" | "Google" | "Design" | "Open Source & Academic";
}

export const OFFICIAL_CREATOR_OPTIONS: MetadataOption[] = [
  // Microsoft
  { label: "Word (Microsoft 365)", value: "Microsoft® Word for Microsoft 365", category: "Microsoft" },
  { label: "Word 2021", value: "Microsoft® Word 2021", category: "Microsoft" },
  { label: "Word 2019", value: "Microsoft® Word 2019", category: "Microsoft" },
  { label: "Excel (Microsoft 365)", value: "Microsoft® Excel® for Microsoft 365", category: "Microsoft" },
  { label: "PowerPoint (Microsoft 365)", value: "Microsoft® PowerPoint® for Microsoft 365", category: "Microsoft" },

  // Adobe
  { label: "InDesign (Windows)", value: "Adobe InDesign 19.0 (Windows)", category: "Adobe" },
  { label: "InDesign (macOS)", value: "Adobe InDesign 19.0 (Macintosh)", category: "Adobe" },
  { label: "Acrobat Pro", value: "Adobe Acrobat Pro (64-bit) 24.1", category: "Adobe" },
  { label: "Illustrator", value: "Adobe Illustrator 28.0 (Windows)", category: "Adobe" },
  { label: "Photoshop", value: "Adobe Photoshop 2024 (Windows)", category: "Adobe" },

  // Apple
  { label: "Pages", value: "Pages", category: "Apple" },
  { label: "Keynote", value: "Keynote", category: "Apple" },
  { label: "Numbers", value: "Numbers", category: "Apple" },
  { label: "Preview", value: "Preview", category: "Apple" },

  // Google
  { label: "Google Docs", value: "Google Docs", category: "Google" },
  { label: "Google Sheets", value: "Google Sheets", category: "Google" },
  { label: "Google Slides", value: "Google Slides", category: "Google" },

  // Design
  { label: "Canva", value: "Canva", category: "Design" },
  { label: "Figma", value: "Figma", category: "Design" },

  // Open Source & Academic
  { label: "LibreOffice Writer", value: "Writer", category: "Open Source & Academic" },
  { label: "LibreOffice Calc", value: "Calc", category: "Open Source & Academic" },
  { label: "LaTeX with hyperref", value: "LaTeX with hyperref", category: "Open Source & Academic" },
];

export const OFFICIAL_PRODUCER_OPTIONS: MetadataOption[] = [
  // Microsoft
  { label: "Word 365 Engine", value: "Microsoft® Word for Microsoft 365", category: "Microsoft" },
  { label: "Microsoft: Print to PDF", value: "Microsoft: Print to PDF", category: "Microsoft" },
  { label: "Word 2021 Engine", value: "Microsoft® Word 2021", category: "Microsoft" },
  { label: "Word 2019 Engine", value: "Microsoft® Word 2019", category: "Microsoft" },

  // Adobe
  { label: "Adobe PDF Library 17.0", value: "Adobe PDF Library 17.0", category: "Adobe" },
  { label: "Adobe PDF Library 24.1", value: "Adobe PDF Library 24.1", category: "Adobe" },
  { label: "Acrobat Distiller 24.0", value: "Acrobat Distiller 24.0 (Windows)", category: "Adobe" },

  // Apple
  { label: "macOS Quartz (14.5)", value: "macOS Version 14.5 (Build 23F79) Quartz PDFContext", category: "Apple" },
  { label: "macOS Quartz", value: "macOS Quartz PDFContext", category: "Apple" },
  { label: "iOS Quartz", value: "iOS Version 17.5.1 (Build 21F90) Quartz PDFContext", category: "Apple" },

  // Google
  { label: "Skia/PDF m124", value: "Skia/PDF m124", category: "Google" },
  { label: "Skia/PDF m120", value: "Skia/PDF m120", category: "Google" },

  // Design
  { label: "Canva", value: "Canva", category: "Design" },
  { label: "Figma", value: "Figma", category: "Design" },

  // Open Source & Developer
  { label: "LibreOffice 24.2", value: "LibreOffice 24.2", category: "Open Source & Academic" },
  { label: "GPL Ghostscript 10.03.0", value: "GPL Ghostscript 10.03.0", category: "Open Source & Academic" },
  { label: "pdfTeX-1.40.25", value: "pdfTeX-1.40.25", category: "Open Source & Academic" },
  { label: "pdf-lib", value: "pdf-lib (https://github.com/Hopding/pdf-lib)", category: "Open Source & Academic" },
  { label: "iText 7", value: "iText® 7.2.5 ©2000-2023 iText Group NV", category: "Open Source & Academic" },
];
