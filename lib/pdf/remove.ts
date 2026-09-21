import { PDFDocument } from "pdf-lib";
import { downloadPdf } from "./download";
import { sanitizeFilename, validatePdfBuffer } from "./validation";

export interface RemovePagesInput {
  data: ArrayBuffer | Uint8Array;
  name: string;
  pagesToRemove: number[];
}

export interface RemovePagesResult {
  data: Uint8Array;
  filename: string;
  removedCount: number;
  remainingCount: number;
}

/**
 * Generates output filename for page removal:
 * [OriginalFileName]_pages_removed.pdf
 */
export function getRemovePagesFilename(originalName: string): string {
  const baseName = originalName.replace(/\.pdf$/i, "").replace(/[-_]/g, "_").trim();
  const rawFilename = `${baseName}_pages_removed.pdf`;
  return sanitizeFilename(rawFilename, "document_pages_removed.pdf");
}

/**
 * Removes specified pages from a PDF document, ensuring at least one page remains.
 *
 * @throws {Error} if all pages are marked for removal, or if PDF is invalid
 */
export async function removePdfPages(input: RemovePagesInput): Promise<RemovePagesResult> {
  const { data, name, pagesToRemove } = input;

  const validation = validatePdfBuffer(data, name);
  if (!validation.isValid) {
    throw new Error(`Invalid PDF document "${name}": ${validation.error}`);
  }

  const srcDoc = await PDFDocument.load(data, { ignoreEncryption: true });
  const totalPages = srcDoc.getPageCount();

  const removeSet = new Set(pagesToRemove.filter((p) => p >= 1 && p <= totalPages));

  if (removeSet.size >= totalPages) {
    throw new Error(
      "Cannot remove all pages from document. At least one page must remain in the final PDF."
    );
  }

  if (removeSet.size === 0) {
    throw new Error("No pages were marked for removal.");
  }

  const remainingPages: number[] = [];
  for (let p = 1; p <= totalPages; p++) {
    if (!removeSet.has(p)) {
      remainingPages.push(p);
    }
  }

  const newDoc = await PDFDocument.create();
  const zeroBasedIndices = remainingPages.map((p) => p - 1);
  const copiedPages = await newDoc.copyPages(srcDoc, zeroBasedIndices);

  for (const page of copiedPages) {
    newDoc.addPage(page);
  }

  const outputBytes = await newDoc.save();
  const filename = getRemovePagesFilename(name);

  return {
    data: outputBytes,
    filename,
    removedCount: removeSet.size,
    remainingCount: remainingPages.length,
  };
}

/**
 * Removes marked pages and triggers immediate browser download
 */
export async function removeAndDownloadPdfPages(
  input: RemovePagesInput
): Promise<RemovePagesResult> {
  const result = await removePdfPages(input);
  downloadPdf(result.data, result.filename);
  return result;
}
