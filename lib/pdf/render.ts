import type { PageThumbnailOptions } from "./types";
import type { PDFDocumentProxy, PDFDocumentLoadingTask } from "pdfjs-dist";

/**
 * Concurrency limiter to prevent hundreds of canvases from rendering simultaneously
 */
class ConcurrencyQueue {
  private activeCount = 0;
  private queue: Array<() => Promise<void>> = [];
  private readonly maxConcurrency: number;

  constructor(maxConcurrency = 4) {
    this.maxConcurrency = maxConcurrency;
  }

  async run<T>(task: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const execute = async () => {
        this.activeCount++;
        try {
          const result = await task();
          resolve(result);
        } catch (err) {
          reject(err);
        } finally {
          this.activeCount--;
          const next = this.queue.shift();
          if (next) {
            void next();
          }
        }
      };

      if (this.activeCount < this.maxConcurrency) {
        void execute();
      } else {
        this.queue.push(execute);
      }
    });
  }

  clear(): void {
    this.queue = [];
  }
}

function getOptimalConcurrency(): number {
  if (typeof navigator !== "undefined" && navigator.hardwareConcurrency) {
    return Math.min(6, Math.max(3, navigator.hardwareConcurrency));
  }
  return 4;
}

const renderQueue = new ConcurrencyQueue(getOptimalConcurrency());

/**
 * Fast document fingerprint generator to identify PDF buffers in memory
 */
function getDocumentFingerprint(data: ArrayBuffer | Uint8Array): string {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  const len = bytes.byteLength;
  let hash = `doc_${len}_`;
  const sampleLen = Math.min(32, len);
  for (let i = 0; i < sampleLen; i++) {
    hash += (bytes[i] ?? 0).toString(16);
  }
  const tailStart = Math.max(0, len - sampleLen);
  for (let i = tailStart; i < len; i++) {
    hash += (bytes[i] ?? 0).toString(16);
  }
  return hash;
}

interface CachedDocEntry {
  loadingTask: PDFDocumentLoadingTask;
  docPromise: Promise<PDFDocumentProxy>;
  fingerprint: string;
  lastUsed: number;
}

/**
 * Shared PDFDocumentProxy cache to prevent parsing the entire PDF document hundreds of times
 */
const documentCache = new Map<string, CachedDocEntry>();

/**
 * Simple in-memory thumbnail cache to avoid re-rendering pages during reorders or tab switching
 */
const thumbnailCache = new Map<string, string>();

/**
 * Clear thumbnail cache and release all loaded document instances
 */
export async function clearThumbnailCache(): Promise<void> {
  thumbnailCache.clear();
  renderQueue.clear();

  const entries = Array.from(documentCache.values());
  documentCache.clear();
  for (const entry of entries) {
    try {
      const doc = await entry.docPromise;
      await doc.cleanup();
    } catch {
      // Ignore cleanup error
    }
    try {
      await entry.loadingTask.destroy();
    } catch {
      // Ignore destroy error
    }
  }
}

/**
 * Release a specific PDF document from memory
 */
export async function releasePdfDocument(data: ArrayBuffer | Uint8Array): Promise<void> {
  const key = getDocumentFingerprint(data);
  const entry = documentCache.get(key);
  if (entry) {
    documentCache.delete(key);
    try {
      const doc = await entry.docPromise;
      await doc.cleanup();
    } catch {
      // Ignored
    }
    try {
      await entry.loadingTask.destroy();
    } catch {
      // Ignored
    }
  }
}

/**
 * Lazy loads pdfjs-dist on client-side and configures worker
 */
export async function getPdfJs() {
  if (typeof window === "undefined") {
    throw new Error("PDF.js rendering can only be executed in a browser environment.");
  }

  const pdfjs = await import("pdfjs-dist");

  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  }

  return pdfjs;
}

/**
 * Gets or initializes a shared PDFDocumentProxy for a given PDF buffer
 */
export async function getSharedPdfDocument(
  data: ArrayBuffer | Uint8Array
): Promise<PDFDocumentProxy> {
  const key = getDocumentFingerprint(data);
  const existing = documentCache.get(key);
  if (existing) {
    existing.lastUsed = Date.now();
    return existing.docPromise;
  }

  const pdfjs = await getPdfJs();
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);

  // Load document with typed data clone to prevent detached array buffer errors
  const loadingTask = pdfjs.getDocument({
    data: bytes.slice(),
    disableFontFace: false,
  });

  const docPromise = loadingTask.promise;
  documentCache.set(key, {
    loadingTask,
    docPromise,
    fingerprint: key,
    lastUsed: Date.now(),
  });

  return docPromise;
}

/**
 * Render a specific page directly from an active PDFDocumentProxy instance
 */
export async function renderPageFromDocument(
  doc: PDFDocumentProxy,
  pageNumber: number,
  options: PageThumbnailOptions = {},
  docKey?: string
): Promise<string> {
  const key = docKey ?? (doc.fingerprints?.[0] ?? "doc");
  const cacheKey = `${key}-${pageNumber}-${options.width ?? 150}-${options.height ?? 200}`;
  const cached = thumbnailCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  return renderQueue.run(async () => {
    // Check cache again in case another queue job completed it while waiting
    const existing = thumbnailCache.get(cacheKey);
    if (existing) return existing;

    const page = await doc.getPage(pageNumber);

    try {
      // Determine viewport scale based on desired dimensions
      const unscaledViewport = page.getViewport({ scale: 1.0 });
      let scale = options.scale ?? 1.0;

      if (options.width || options.height) {
        const targetW = options.width ?? 150;
        const targetH = options.height ?? 200;
        const scaleW = targetW / unscaledViewport.width;
        const scaleH = targetH / unscaledViewport.height;
        scale = Math.min(scaleW, scaleH);
      }

      const viewport = page.getViewport({ scale });

      const canvas = document.createElement("canvas");
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);

      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) {
        throw new Error("Unable to create 2D canvas context for PDF rendering.");
      }

      // Draw white background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const renderContext = {
        canvas,
        canvasContext: ctx,
        viewport,
      };

      await page.render(renderContext).promise;

      const dataUrl = canvas.toDataURL(
        "image/jpeg",
        options.quality ?? 0.8
      );

      // Cache the result
      thumbnailCache.set(cacheKey, dataUrl);

      // Clean up canvas
      canvas.width = 0;
      canvas.height = 0;

      return dataUrl;
    } finally {
      page.cleanup();
    }
  });
}

/**
 * Render a specific page of a PDF document to an image data URL, reusing the shared document instance
 *
 * @param data ArrayBuffer or Uint8Array of the PDF
 * @param pageNumber 1-based page number
 * @param options scale, max width, max height, quality
 */
export async function renderPageThumbnail(
  data: ArrayBuffer | Uint8Array,
  pageNumber: number,
  options: PageThumbnailOptions = {}
): Promise<string> {
  const docKey = getDocumentFingerprint(data);
  const cacheKey = `${docKey}-${pageNumber}-${options.width ?? 150}-${options.height ?? 200}`;
  const cached = thumbnailCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const doc = await getSharedPdfDocument(data);
  return renderPageFromDocument(doc, pageNumber, options, docKey);
}

/**
 * Batch render page thumbnails for a document and emit updates in progressive chunks
 *
 * @param data PDF array buffer
 * @param pageNumbers Array of 1-based page numbers to render
 * @param options Thumbnail render options
 * @param onBatch Callback triggered when a chunk of thumbnails finishes rendering
 * @param batchSize Number of thumbnails per batch before triggering onBatch
 */
export async function renderDocumentThumbnailsBatch(
  data: ArrayBuffer | Uint8Array,
  pageNumbers: number[],
  options: PageThumbnailOptions = {},
  onBatch: (thumbnails: Record<number, string>) => void,
  batchSize = 10
): Promise<Record<number, string>> {
  const docKey = getDocumentFingerprint(data);
  const doc = await getSharedPdfDocument(data);
  const results: Record<number, string> = {};
  let pendingBatch: Record<number, string> = {};
  let pendingCount = 0;

  const flushBatch = () => {
    if (pendingCount > 0) {
      onBatch({ ...pendingBatch });
      pendingBatch = {};
      pendingCount = 0;
    }
  };

  const jobs = pageNumbers.map(async (p) => {
    try {
      const url = await renderPageFromDocument(doc, p, options, docKey);
      results[p] = url;
      pendingBatch[p] = url;
      pendingCount++;
      if (pendingCount >= batchSize) {
        flushBatch();
      }
    } catch {
      // Allow individual page render failures without breaking the rest
    }
  });

  await Promise.all(jobs);
  flushBatch();

  return results;
}
