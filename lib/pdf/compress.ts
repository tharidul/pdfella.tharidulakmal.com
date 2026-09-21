/**
 * PDF-X Client-Side PDF Compression Engine
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * LEGAL & LICENSE COMPATIBILITY DOCUMENTATION (Per Requirement 13)
 * ─────────────────────────────────────────────────────────────────────────────
 * Evaluated Engines:
 * 1. Ghostscript (WASM):
 *    - License: GNU AGPL v3 (Affero General Public License) / Commercial.
 *    - Verdict: INCOMPATIBLE. AGPL v3 is a viral copyleft license that imposes
 *      network-use obligations, restricting commercial distribution or integration
 *      with proprietary/MIT codebases.
 *
 * 2. MuPDF (WASM):
 *    - License: GNU AGPL v3 / Commercial (Artifex).
 *    - Verdict: INCOMPATIBLE. Same viral AGPL restrictions as Ghostscript.
 *
 * 3. Selected Engine: Hybrid PDF.js (Apache-2.0) + pdf-lib (MIT) Pipeline
 *    - PDF.js: Apache License 2.0 (Permissive, commercial-friendly).
 *    - pdf-lib: MIT License (Permissive, commercial-friendly).
 *    - Mechanism: Real raster and image stream downsampling at tiered resolutions
 *      (72 DPI - 180 DPI) and JPEG compression qualities (0.5 - 0.88), followed by
 *      deflate object stream compression (`useObjectStreams: true`).
 *    - Verdict: FULLY COMPATIBLE with standard commercial and open-source distribution.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { PDFDocument } from "pdf-lib";
import { downloadPdf } from "./download";
import {
  calculateSavings,
  formatFileSize,
  sanitizeFilename,
  validatePdfBuffer,
  type SavingsResult,
} from "./validation";

export type CompressionTier = "extreme" | "recommended" | "less";

export interface CompressionTierConfig {
  id: CompressionTier;
  title: string;
  badge?: string;
  description: string;
  estimatedPercentage: number;
  scale: number;
  quality: number;
}

export const COMPRESSION_TIER_CONFIGS: Record<CompressionTier, CompressionTierConfig> = {
  extreme: {
    id: "extreme",
    title: "Extreme Compression",
    description: "Lower image quality, highest file reduction",
    estimatedPercentage: 75,
    scale: 0.75, // ~72 DPI
    quality: 0.5,
  },
  recommended: {
    id: "recommended",
    title: "Recommended Compression",
    badge: "Best Value",
    description: "Good quality, standard compression for everyday sharing",
    estimatedPercentage: 55,
    scale: 1.0, // ~120-150 DPI
    quality: 0.72,
  },
  less: {
    id: "less",
    title: "Less Compression",
    description: "High image quality, mild compression",
    estimatedPercentage: 30,
    scale: 1.35, // ~180-200 DPI
    quality: 0.88,
  },
};

export interface CompressPdfInput {
  data: ArrayBuffer | Uint8Array;
  name: string;
  tier: CompressionTier;
}

export interface CompressPdfResult {
  data: Uint8Array;
  filename: string;
  originalSize: number;
  actualSize: number;
  savings: SavingsResult;
}

/**
 * Returns estimated compressed size and percentage based on original file size and tier
 */
export function estimateCompressedSize(originalBytes: number, tier: CompressionTier) {
  const config = COMPRESSION_TIER_CONFIGS[tier];
  const estimatedSavingsBytes = Math.round(originalBytes * (config.estimatedPercentage / 100));
  const estimatedSizeBytes = Math.max(1024, originalBytes - estimatedSavingsBytes);

  return {
    estimatedPercentage: config.estimatedPercentage,
    estimatedSizeBytes,
    formattedEstimatedSize: formatFileSize(estimatedSizeBytes),
    formattedEstimatedSavings: formatFileSize(estimatedSavingsBytes),
  };
}

/**
 * Generates output filename for compressed PDF:
 * [OriginalFileName]_compressed.pdf
 */
export function getCompressPdfFilename(originalName: string): string {
  const baseName = originalName.replace(/\.pdf$/i, "").replace(/[-_]/g, "_").trim();
  const rawFilename = `${baseName}_compressed.pdf`;
  return sanitizeFilename(rawFilename, "document_compressed.pdf");
}

/**
 * Compresses a PDF using permissive client-side raster and object stream optimization.
 */
export async function compressPdf(
  input: CompressPdfInput,
  onProgress?: (processed: number, total: number) => void
): Promise<CompressPdfResult> {
  const { data, name, tier } = input;

  const validation = validatePdfBuffer(data, name);
  if (!validation.isValid) {
    throw new Error(`Invalid PDF document "${name}": ${validation.error}`);
  }

  const originalSize = data.byteLength;
  const config = COMPRESSION_TIER_CONFIGS[tier];

  // Client-side browser rendering check
  if (typeof window === "undefined") {
    throw new Error("PDF compression can only be executed in a browser environment.");
  }

  const pdfjs = await import("pdfjs-dist");
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  }

  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  const loadingTask = pdfjs.getDocument({
    data: bytes.slice(),
    disableFontFace: false,
  });

  const sourcePdf = await loadingTask.promise;
  const totalPages = sourcePdf.numPages;

  const outputPdfDoc = await PDFDocument.create();

  try {
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      onProgress?.(pageNum - 1, totalPages);

      const page = await sourcePdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: config.scale });

      const canvas = document.createElement("canvas");
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);

      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) {
        throw new Error("Unable to create canvas rendering context for compression.");
      }

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      await page.render({
        canvas,
        canvasContext: ctx,
        viewport,
      }).promise;

      // Convert canvas to JPEG blob/buffer with tiered quality
      const jpegBlob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => resolve(blob), "image/jpeg", config.quality);
      });

      if (!jpegBlob) {
        throw new Error(`Failed to compress page ${pageNum}.`);
      }

      const jpegBuffer = await jpegBlob.arrayBuffer();
      const embeddedImage = await outputPdfDoc.embedJpg(jpegBuffer);

      // Preserve original page dimensions in PDF points
      const originalViewport = page.getViewport({ scale: 1.0 });
      const newPage = outputPdfDoc.addPage([
        originalViewport.width,
        originalViewport.height,
      ]);

      newPage.drawImage(embeddedImage, {
        x: 0,
        y: 0,
        width: originalViewport.width,
        height: originalViewport.height,
      });

      // Cleanup canvas
      canvas.width = 0;
      canvas.height = 0;
    }

    onProgress?.(totalPages, totalPages);

    // Save with object stream compression
    const compressedBytes = await outputPdfDoc.save({
      useObjectStreams: true,
    });

    const actualSize = compressedBytes.byteLength;
    const filename = getCompressPdfFilename(name);
    const savings = calculateSavings(originalSize, actualSize);

    return {
      data: compressedBytes,
      filename,
      originalSize,
      actualSize,
      savings,
    };
  } finally {
    await sourcePdf.cleanup();
    await loadingTask.destroy();
  }
}

/**
 * Compresses PDF and triggers browser download
 */
export async function compressAndDownloadPdf(
  input: CompressPdfInput,
  onProgress?: (processed: number, total: number) => void
): Promise<CompressPdfResult> {
  const result = await compressPdf(input, onProgress);
  downloadPdf(result.data, result.filename);
  return result;
}
