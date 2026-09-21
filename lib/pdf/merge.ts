import { loadPdfLib } from "./loader";
import { downloadPdf } from "./download";
import { validatePdfBuffer } from "./validation";

export interface MergeInputItem {
  id: string;
  name: string;
  data: ArrayBuffer | Uint8Array;
}

export interface MergeResult {
  data: Uint8Array;
  filename: string;
  pageCount: number;
}

/**
 * Generate a timestamped merged PDF filename: merged-pdf-YYYY-MM-DD.pdf
 */
export function getMergedPdfFilename(date = new Date()): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `merged-pdf-${yyyy}-${mm}-${dd}.pdf`;
}

/**
 * Combines multiple PDF documents into a single PDF in the specified order.
 * Preserves page dimensions and orientations.
 *
 * @throws {Error} if fewer than 2 documents are provided or any document is corrupted.
 */
export async function mergePdfs(
  items: MergeInputItem[],
  onProgress?: (processed: number, total: number) => void
): Promise<MergeResult> {
  if (!items || items.length < 2) {
    throw new Error("At least 2 PDF documents are required to perform a merge.");
  }

  // Validate all files first
  for (const item of items) {
    const val = validatePdfBuffer(item.data, item.name);
    if (!val.isValid) {
      throw new Error(`Cannot merge "${item.name}": ${val.error}`);
    }
  }

  const { PDFDocument } = await loadPdfLib();
  const mergedDoc = await PDFDocument.create();
  let totalMergedPages = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item) continue;

    onProgress?.(i, items.length);

    try {
      const srcDoc = await PDFDocument.load(item.data, {
        ignoreEncryption: true,
      });

      const pageIndices = srcDoc.getPageIndices();
      const copiedPages = await mergedDoc.copyPages(srcDoc, pageIndices);

      for (const page of copiedPages) {
        mergedDoc.addPage(page);
        totalMergedPages++;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "corrupted PDF";
      throw new Error(`Failed to load "${item.name}" for merging: ${msg}`);
    }
  }

  onProgress?.(items.length, items.length);

  const mergedBytes = await mergedDoc.save();
  const filename = getMergedPdfFilename();

  return {
    data: mergedBytes,
    filename,
    pageCount: totalMergedPages,
  };
}

/**
 * Merges PDFs and triggers immediate browser download
 */
export async function mergeAndDownloadPdfs(
  items: MergeInputItem[],
  onProgress?: (processed: number, total: number) => void
): Promise<MergeResult> {
  const result = await mergePdfs(items, onProgress);
  downloadPdf(result.data, result.filename);
  return result;
}
