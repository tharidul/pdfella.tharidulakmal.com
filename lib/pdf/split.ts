import { PDFDocument } from "pdf-lib";
import { downloadPdf } from "./download";
import { formatPageRange } from "./range";
import { sanitizeFilename, validatePdfBuffer } from "./validation";

export interface SplitPdfInput {
  data: ArrayBuffer | Uint8Array;
  name: string;
  selectedPages: number[];
}

export interface SplitPdfResult {
  data: Uint8Array;
  filename: string;
  extractedPageCount: number;
}

/**
 * Generates the output filename for extracted pages:
 * [OriginalFileName]-pages-[SelectedRange].pdf
 */
export function getSplitPdfFilename(originalName: string, selectedPages: number[]): string {
  const baseName = originalName.replace(/\.pdf$/i, "").replace(/[-_]/g, " ").trim();
  const rangeStr = formatPageRange(selectedPages).replace(/\s+/g, "").replace(/,/g, "_");
  const rawFilename = `${baseName}-pages-${rangeStr}.pdf`;
  return sanitizeFilename(rawFilename, "extracted-pages.pdf");
}

/**
 * Extracts specified pages from a PDF document into a new PDF file.
 *
 * @throws {Error} if no pages are selected or page numbers are out of bounds
 */
export async function splitPdf(input: SplitPdfInput): Promise<SplitPdfResult> {
  const { data, name, selectedPages } = input;

  if (!selectedPages || selectedPages.length === 0) {
    throw new Error("Cannot extract pages: No pages selected.");
  }

  const validation = validatePdfBuffer(data, name);
  if (!validation.isValid) {
    throw new Error(`Invalid PDF document "${name}": ${validation.error}`);
  }

  const srcDoc = await PDFDocument.load(data, { ignoreEncryption: true });
  const totalPages = srcDoc.getPageCount();

  // Deduplicate, sort, and validate bounds
  const uniquePages = Array.from(new Set(selectedPages))
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);

  if (uniquePages.length === 0) {
    throw new Error(`Selected pages are outside the valid document range (1-${totalPages}).`);
  }

  const newDoc = await PDFDocument.create();

  // Convert 1-based page numbers to 0-based indices for pdf-lib
  const zeroBasedIndices = uniquePages.map((p) => p - 1);
  const copiedPages = await newDoc.copyPages(srcDoc, zeroBasedIndices);

  for (const page of copiedPages) {
    newDoc.addPage(page);
  }

  const extractedBytes = await newDoc.save();
  const filename = getSplitPdfFilename(name, uniquePages);

  return {
    data: extractedBytes,
    filename,
    extractedPageCount: uniquePages.length,
  };
}

/**
 * Extracts selected pages and triggers immediate browser download
 */
export async function splitAndDownloadPdf(input: SplitPdfInput): Promise<SplitPdfResult> {
  const result = await splitPdf(input);
  downloadPdf(result.data, result.filename);
  return result;
}
