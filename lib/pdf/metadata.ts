import { loadPdfLib } from "./loader";
import type { PdfDocumentMetadata, UpdatePdfMetadataOptions } from "./types";
import { formatFileSize, sanitizeFilename } from "./validation";
import { downloadPdf } from "./download";

async function getArrayBuffer(
  input: File | ArrayBuffer | Uint8Array
): Promise<{ buffer: ArrayBuffer; byteSize: number; originalName?: string }> {
  if (input instanceof File) {
    const buffer = await input.arrayBuffer();
    return { buffer, byteSize: input.size, originalName: input.name };
  } else if (input instanceof Uint8Array) {
    const buffer = input.buffer.slice(
      input.byteOffset,
      input.byteOffset + input.byteLength
    ) as ArrayBuffer;
    return { buffer, byteSize: input.byteLength };
  } else {
    return { buffer: input, byteSize: input.byteLength };
  }
}

export async function extractPdfMetadata(
  input: File | ArrayBuffer | Uint8Array,
  originalFilename?: string
): Promise<PdfDocumentMetadata> {
  const { buffer, byteSize, originalName } = await getArrayBuffer(input);
  const name = originalFilename ?? originalName ?? "document.pdf";
  const cleanName = sanitizeFilename(name);

  const { PDFDocument } = await loadPdfLib();
  const pdfDoc = await PDFDocument.load(buffer, {
    ignoreEncryption: true,
    updateMetadata: false,
  });

  const pageCount = pdfDoc.getPageCount();
  const title = pdfDoc.getTitle() || undefined;
  const author = pdfDoc.getAuthor() || undefined;
  const subject = pdfDoc.getSubject() || undefined;
  const keywords = pdfDoc.getKeywords() || undefined;
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
    subject,
    keywords,
    creator,
    producer,
    creationDate,
    modificationDate,
  };
}

export async function updatePdfMetadata(
  input: File | ArrayBuffer | Uint8Array,
  options: UpdatePdfMetadataOptions
): Promise<Uint8Array> {
  const { buffer } = await getArrayBuffer(input);
  const { PDFDocument } = await loadPdfLib();
  const pdfDoc = await PDFDocument.load(buffer, {
    ignoreEncryption: true,
  });

  if (options.title !== undefined) {
    pdfDoc.setTitle(options.title);
  }
  if (options.author !== undefined) {
    pdfDoc.setAuthor(options.author);
  }
  if (options.subject !== undefined) {
    pdfDoc.setSubject(options.subject);
  }
  if (options.keywords !== undefined) {
    const kwList = options.keywords
      .split(/[,;\n]+/)
      .map((k) => k.trim())
      .filter(Boolean);
    pdfDoc.setKeywords(kwList);
  }
  if (options.creator !== undefined) {
    pdfDoc.setCreator(options.creator);
  }
  if (options.producer !== undefined) {
    pdfDoc.setProducer(options.producer);
  }
  if (options.creationDate !== undefined && options.creationDate !== null) {
    pdfDoc.setCreationDate(options.creationDate);
  }
  if (options.modificationDate !== undefined && options.modificationDate !== null) {
    pdfDoc.setModificationDate(options.modificationDate);
  }

  return pdfDoc.save();
}

export async function sanitizePdfMetadata(
  input: File | ArrayBuffer | Uint8Array
): Promise<Uint8Array> {
  const { buffer } = await getArrayBuffer(input);
  const { PDFDocument, PDFName } = await loadPdfLib();
  const pdfDoc = await PDFDocument.load(buffer, {
    ignoreEncryption: true,
    updateMetadata: false,
  });

  // Clear all identifying fields
  pdfDoc.setTitle("");
  pdfDoc.setAuthor("");
  pdfDoc.setSubject("");
  pdfDoc.setKeywords([]);
  pdfDoc.setProducer("");
  pdfDoc.setCreator("");

  // Remove XMP metadata stream from catalog if present
  if (pdfDoc.catalog.has(PDFName.of("Metadata"))) {
    pdfDoc.catalog.delete(PDFName.of("Metadata"));
  }

  return pdfDoc.save();
}

export async function updateMetadataAndDownload(
  input: File | ArrayBuffer | Uint8Array,
  originalFilename: string,
  options: UpdatePdfMetadataOptions
): Promise<void> {
  const pdfBytes = await updatePdfMetadata(input, options);
  const cleanBase = originalFilename.replace(/\.[^/.]+$/, "");
  downloadPdf(pdfBytes, `${cleanBase}_updated.pdf`);
}

export async function sanitizeMetadataAndDownload(
  input: File | ArrayBuffer | Uint8Array,
  originalFilename: string
): Promise<void> {
  const pdfBytes = await sanitizePdfMetadata(input);
  const cleanBase = originalFilename.replace(/\.[^/.]+$/, "");
  downloadPdf(pdfBytes, `${cleanBase}_sanitized.pdf`);
}
