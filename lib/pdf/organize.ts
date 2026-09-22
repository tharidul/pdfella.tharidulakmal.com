import { loadPdfLib } from "./loader";
import { downloadPdf } from "./download";
import { sanitizeFilename, validatePdfBuffer } from "./validation";

export interface OrganizePageOrder {
  id: string;
  originalNumber: number; 
  rotation: number; 
}

export interface OrganizePdfInput {
  data: ArrayBuffer | Uint8Array;
  name: string;
  pages: OrganizePageOrder[];
}

export interface OrganizePdfResult {
  data: Uint8Array;
  filename: string;
  pageCount: number;
}

export function getOrganizePdfFilename(originalName: string): string {
  const baseName = originalName.replace(/\.pdf$/i, "").replace(/[-_]/g, "_").trim();
  const rawFilename = `${baseName}_organized.pdf`;
  return sanitizeFilename(rawFilename, "document_organized.pdf");
}

export async function organizePdf(input: OrganizePdfInput): Promise<OrganizePdfResult> {
  const { data, name, pages } = input;

  if (!pages || pages.length === 0) {
    throw new Error("Cannot organize document: At least one page must remain.");
  }

  const validation = validatePdfBuffer(data, name);
  if (!validation.isValid) {
    throw new Error(`Invalid PDF document "${name}": ${validation.error}`);
  }

  const { PDFDocument, degrees } = await loadPdfLib();
  const srcDoc = await PDFDocument.load(data, { ignoreEncryption: true });
  const newDoc = await PDFDocument.create();

  for (const item of pages) {
    const zeroBasedIndex = item.originalNumber - 1;
    const [copiedPage] = await newDoc.copyPages(srcDoc, [zeroBasedIndex]);

    if (copiedPage) {
      if (item.rotation !== 0) {
        const currentAngle = copiedPage.getRotation().angle;
        const normalizedDelta = ((item.rotation % 360) + 360) % 360;
        const targetAngle = (currentAngle + normalizedDelta) % 360;
        copiedPage.setRotation(degrees(targetAngle));
      }
      newDoc.addPage(copiedPage);
    }
  }

  const outputBytes = await newDoc.save();
  const filename = getOrganizePdfFilename(name);

  return {
    data: outputBytes,
    filename,
    pageCount: pages.length,
  };
}

export async function organizeAndDownloadPdf(
  input: OrganizePdfInput
): Promise<OrganizePdfResult> {
  const result = await organizePdf(input);
  downloadPdf(result.data, result.filename);
  return result;
}
