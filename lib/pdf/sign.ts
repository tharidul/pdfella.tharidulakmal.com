import { loadPdfLib } from "./loader";
import { downloadPdf } from "./download";
import { sanitizeFilename } from "./validation";
import type { PDFImage } from "pdf-lib";

export interface SignaturePlacement {
  id: string;
  pageNumber: number; // 1-based page index
  xPercent: number; // 0 to 100 percentage from left of page
  yPercent: number; // 0 to 100 percentage from top of page
  widthPercent: number; // percentage of page width
  heightPercent: number; // percentage of page height
  imageDataUrl: string; // Base64 transparent PNG
  aspectRatio?: number; // Intrinsic width / height ratio
  label?: string; // e.g. "Signature", "Date", "Initials"
}

export interface SignPdfInput {
  data: ArrayBuffer | Uint8Array;
  name: string;
  placements: SignaturePlacement[];
}

/**
 * Converts a base64 Data URL to a Uint8Array
 */
function dataUrlToBytes(dataUrl: string): Uint8Array {
  const parts = dataUrl.split(",");
  const base64 = parts[1] ?? "";
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Superimposes signature and stamp images onto specified pages of a PDF document
 * using proportionate relative percentage coordinates.
 */
export async function signPdf(
  data: ArrayBuffer | Uint8Array,
  placements: SignaturePlacement[]
): Promise<Uint8Array> {
  if (placements.length === 0) {
    throw new Error("No signatures or stamps have been placed on the document.");
  }

  const { PDFDocument } = await loadPdfLib();
  const pdfDoc = await PDFDocument.load(data);
  const pages = pdfDoc.getPages();

  // Embed unique images to avoid duplicating identical stamps in memory
  const imageCache = new Map<string, PDFImage>();

  for (const placement of placements) {
    const pageIdx = placement.pageNumber - 1;
    if (pageIdx < 0 || pageIdx >= pages.length) {
      continue;
    }

    const page = pages[pageIdx];
    if (!page) continue;

    const { width: pageWidth, height: pageHeight } = page.getSize();

    // Calculate dimensions in PDF point space from relative percentage
    const drawWidth = Math.max(10, (placement.widthPercent / 100) * pageWidth);
    const drawHeight = Math.max(10, (placement.heightPercent / 100) * pageHeight);
    const drawX = Math.max(0, (placement.xPercent / 100) * pageWidth);

    // PDF coordinate system origin is bottom-left; HTML canvas/screen origin is top-left
    const drawY = Math.max(
      0,
      pageHeight - (placement.yPercent / 100) * pageHeight - drawHeight
    );

    // Get or embed the PNG image
    let embeddedImage = imageCache.get(placement.imageDataUrl);
    if (!embeddedImage) {
      const bytes = dataUrlToBytes(placement.imageDataUrl);
      embeddedImage = await pdfDoc.embedPng(bytes);
      imageCache.set(placement.imageDataUrl, embeddedImage);
    }

    page.drawImage(embeddedImage, {
      x: drawX,
      y: drawY,
      width: drawWidth,
      height: drawHeight,
    });
  }

  return pdfDoc.save();
}

/**
 * Signs the PDF and immediately triggers a client-side download
 */
export async function signAndDownloadPdf(input: SignPdfInput): Promise<void> {
  const signedBytes = await signPdf(input.data, input.placements);
  const rawBase = input.name.replace(/\.pdf$/i, "");
  const base = sanitizeFilename(rawBase, "document");
  const outputFilename = `${base}_signed.pdf`;

  downloadPdf(signedBytes, outputFilename);
}

/**
 * Triggers a client-side browser download of a signature PNG,
 * either with a transparent background or with a solid white background.
 */
export function downloadSignatureImage(
  dataUrl: string,
  background: "transparent" | "white",
  filename = "signature"
): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const rawClean = filename.replace(/\.(pdf|png|jpe?g)$/i, "").trim() || "signature";
  const safeFilename = sanitizeFilename(`${rawClean}.png`, "signature.png").replace(/\.png$/i, "");

  if (background === "transparent") {
    const anchor = document.createElement("a");
    anchor.href = dataUrl;
    anchor.download = `${safeFilename}-transparent.png`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    return;
  }

  // Render on offscreen canvas with solid white background
  const img = new window.Image();
  let executed = false;

  const processAndDownload = () => {
    if (executed) return;
    executed = true;

    try {
      const canvas = document.createElement("canvas");
      const width = Math.max(1, img.naturalWidth || 400);
      const height = Math.max(1, img.naturalHeight || 200);
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Fill pure solid white
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);

      // Superimpose the signature graphic
      ctx.drawImage(img, 0, 0, width, height);

      const whiteDataUrl = canvas.toDataURL("image/png");
      const anchor = document.createElement("a");
      anchor.href = whiteDataUrl;
      anchor.download = `${safeFilename}-white-bg.png`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    } catch {
      // Fallback to dataUrl in case canvas context fails
      const fallbackAnchor = document.createElement("a");
      fallbackAnchor.href = dataUrl;
      fallbackAnchor.download = `${safeFilename}-white-bg.png`;
      document.body.appendChild(fallbackAnchor);
      fallbackAnchor.click();
      document.body.removeChild(fallbackAnchor);
    }
  };

  img.onload = processAndDownload;
  img.onerror = () => {
    if (executed) return;
    executed = true;
    const anchor = document.createElement("a");
    anchor.href = dataUrl;
    anchor.download = `${safeFilename}-white-bg.png`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  img.src = dataUrl;
  if (img.complete && img.naturalWidth > 0) {
    processAndDownload();
  }
}
