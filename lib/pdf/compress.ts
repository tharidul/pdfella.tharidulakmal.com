
import { loadPdfLib } from "./loader";
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
    scale: 0.75,
    quality: 0.5,
  },
  recommended: {
    id: "recommended",
    title: "Recommended Compression",
    badge: "Best Value",
    description: "Good quality, standard compression for everyday sharing",
    estimatedPercentage: 55,
    scale: 1.0,
    quality: 0.72,
  },
  less: {
    id: "less",
    title: "Less Compression",
    description: "High image quality, mild compression",
    estimatedPercentage: 30,
    scale: 1.35,
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

export function getCompressPdfFilename(originalName: string): string {
  const baseName = originalName.replace(/\.pdf$/i, "").replace(/[-_]/g, "_").trim();
  const rawFilename = `${baseName}_compressed.pdf`;
  return sanitizeFilename(rawFilename, "document_compressed.pdf");
}

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

  const { PDFDocument } = await loadPdfLib();
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

      const jpegBlob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => resolve(blob), "image/jpeg", config.quality);
      });

      if (!jpegBlob) {
        throw new Error(`Failed to compress page ${pageNum}.`);
      }

      const jpegBuffer = await jpegBlob.arrayBuffer();
      const embeddedImage = await outputPdfDoc.embedJpg(jpegBuffer);

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

      canvas.width = 0;
      canvas.height = 0;
    }

    onProgress?.(totalPages, totalPages);

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

export async function compressAndDownloadPdf(
  input: CompressPdfInput,
  onProgress?: (processed: number, total: number) => void
): Promise<CompressPdfResult> {
  const result = await compressPdf(input, onProgress);
  downloadPdf(result.data, result.filename);
  return result;
}
