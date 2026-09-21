import { PDFDocument } from "pdf-lib";
import type { PdfDocumentMetadata } from "./types";
import { formatFileSize, sanitizeFilename } from "./validation";

/**
 * Extract document metadata (page count, title, author, size) from a PDF file or buffer.
 * Uses pdf-lib for fast, reliable client-side metadata extraction without requiring canvas or DOM.
 */
export async function extractPdfMetadata(
  input: File | ArrayBuffer | Uint8Array,
  originalFilename?: string
): Promise<PdfDocumentMetadata> {
  let buffer: ArrayBuffer;
  let name = originalFilename ?? "document.pdf";
  let byteSize = 0;

  if (input instanceof File) {
    name = input.name;
    byteSize = input.size;
    buffer = await input.arrayBuffer();
  } else if (input instanceof Uint8Array) {
    buffer = input.buffer.slice(
      input.byteOffset,
      input.byteOffset + input.byteLength
    ) as ArrayBuffer;
    byteSize = input.byteLength;
  } else {
    buffer = input;
    byteSize = input.byteLength;
  }

  const cleanName = sanitizeFilename(name);
  const pdfDoc = await PDFDocument.load(buffer, {
    ignoreEncryption: true,
    updateMetadata: false,
  });

  const pageCount = pdfDoc.getPageCount();
  const title = pdfDoc.getTitle() || undefined;
  const author = pdfDoc.getAuthor() || undefined;
  const creator = pdfDoc.getCreator() || undefined;
  const producer = pdfDoc.getProducer() || undefined;
  const creationDate = pdfDoc.getCreationDate() || undefined;
  const modificationDate = pdfDoc.getModificationDate() || undefined;

  return {
    name: cleanName,
    size: byteSize,
    formattedSize: formatFileSize(byteSize),
    pageCount,
    title,
    author,
    creator,
    producer,
    creationDate,
    modificationDate,
  };
}
