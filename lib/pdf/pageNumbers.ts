import type { Color } from "pdf-lib";
import { loadPdfLib } from "./loader";
import { downloadPdf } from "./download";

export type PageNumberPosition =
  | "bottom-center"
  | "bottom-right"
  | "bottom-left"
  | "top-center"
  | "top-right"
  | "top-left";

export type PageNumberFormat =
  | "page-n-of-total" 
  | "n-slash-total"   
  | "n"               
  | "page-n";         

export interface PageNumbersOptions {
  position: PageNumberPosition;
  format: PageNumberFormat;
  fontSize?: number;
  startNumber?: number;
  skipFirstPage?: boolean;
  colorHex?: string;
  margin?: number;
}

function hexToRgb(hex: string, rgbFn: (r: number, g: number, b: number) => Color): Color {
  const cleanHex = hex.replace("#", "");
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255 || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255 || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255 || 0;
  return rgbFn(r, g, b);
}

function formatPageText(
  format: PageNumberFormat,
  pageNum: number,
  totalPages: number
): string {
  switch (format) {
    case "page-n-of-total":
      return `Page ${pageNum} of ${totalPages}`;
    case "n-slash-total":
      return `${pageNum} / ${totalPages}`;
    case "page-n":
      return `Page ${pageNum}`;
    case "n":
    default:
      return `${pageNum}`;
  }
}

export async function addPageNumbersToPdf(
  data: ArrayBuffer | Uint8Array,
  options: PageNumbersOptions
): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts, rgb } = await loadPdfLib();
  const pdfDoc = await PDFDocument.load(data);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();
  const totalPages = pages.length;

  const fontSize = options.fontSize ?? 11;
  const margin = options.margin ?? 30;
  const startNumber = options.startNumber ?? 1;
  const color = options.colorHex ? hexToRgb(options.colorHex, rgb) : rgb(0.3, 0.3, 0.3);

  let currentNumber = startNumber;

  for (let i = 0; i < totalPages; i++) {
    const page = pages[i]!;

    if (i === 0 && options.skipFirstPage) {
      continue;
    }

    const text = formatPageText(options.format, currentNumber, totalPages);
    currentNumber++;

    const textWidth = font.widthOfTextAtSize(text, fontSize);
    const textHeight = font.heightAtSize(fontSize);
    const { width: pageWidth, height: pageHeight } = page.getSize();

    let x = 0;
    let y = 0;

    switch (options.position) {
      case "bottom-center":
        x = (pageWidth - textWidth) / 2;
        y = margin;
        break;
      case "bottom-left":
        x = margin;
        y = margin;
        break;
      case "bottom-right":
        x = pageWidth - margin - textWidth;
        y = margin;
        break;
      case "top-center":
        x = (pageWidth - textWidth) / 2;
        y = pageHeight - margin - textHeight;
        break;
      case "top-left":
        x = margin;
        y = pageHeight - margin - textHeight;
        break;
      case "top-right":
        x = pageWidth - margin - textWidth;
        y = pageHeight - margin - textHeight;
        break;
    }

    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color,
    });
  }

  return pdfDoc.save();
}

export async function addPageNumbersAndDownload(
  data: ArrayBuffer | Uint8Array,
  baseFileName: string,
  options: PageNumbersOptions
): Promise<void> {
  const pdfBytes = await addPageNumbersToPdf(data, options);
  const cleanBase = baseFileName.replace(/\.[^/.]+$/, "");
  downloadPdf(pdfBytes, `${cleanBase}_numbered.pdf`);
}
