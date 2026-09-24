import type { PageThumbnailOptions } from "./types";
import type { PDFDocumentProxy, PDFDocumentLoadingTask } from "pdfjs-dist";

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

function getDocumentFingerprint(data: ArrayBuffer | Uint8Array): string {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  const len = bytes.byteLength;
  const sampleCount = Math.min(256, len);
  let hash = `doc_${len}_`;
  for (let i = 0; i < sampleCount; i++) {
    const offset = Math.floor((i * (len - 1)) / Math.max(1, sampleCount - 1));
    hash += (bytes[offset] ?? 0).toString(16).padStart(2, "0");
  }
  return hash;
}

interface CachedDocEntry {
  loadingTask: PDFDocumentLoadingTask;
  docPromise: Promise<PDFDocumentProxy>;
  fingerprint: string;
  lastUsed: number;
}

const documentCache = new Map<string, CachedDocEntry>();

const thumbnailCache = new Map<string, string>();

export async function clearThumbnailCache(): Promise<void> {
  thumbnailCache.clear();
  renderQueue.clear();

  const entries = Array.from(documentCache.values());
  documentCache.clear();
  for (const entry of entries) {
    try {
      const doc = await entry.docPromise;
      await doc.cleanup();
    } catch (e) {
      console.warn("PDF cleanup failed", e);
    }
    try {
      await entry.loadingTask.destroy();
    } catch (e) {
      console.warn("PDF task destroy failed", e);
    }
  }
}

export async function releasePdfDocument(data: ArrayBuffer | Uint8Array): Promise<void> {
  const key = getDocumentFingerprint(data);
  const entry = documentCache.get(key);
  if (entry) {
    documentCache.delete(key);
    try {
      const doc = await entry.docPromise;
      await doc.cleanup();
    } catch (e) {
      console.warn("PDF cleanup failed", e);
    }
    try {
      await entry.loadingTask.destroy();
    } catch (e) {
      console.warn("PDF task destroy failed", e);
    }
  }
}

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
    const existing = thumbnailCache.get(cacheKey);
    if (existing) return existing;

    const page = await doc.getPage(pageNumber);

    try {
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

      thumbnailCache.set(cacheKey, dataUrl);

      canvas.width = 0;
      canvas.height = 0;

      return dataUrl;
    } finally {
      page.cleanup();
    }
  });
}

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

export async function renderDocumentThumbnailsBatch(
  data: ArrayBuffer | Uint8Array,
  pageNumbers: number[],
  options: PageThumbnailOptions = {},
  onBatch: (thumbnails: Record<number, string>) => void,
  batchSize = 10,
  signal?: AbortSignal
): Promise<Record<number, string>> {
  if (signal?.aborted) return {};
  const docKey = getDocumentFingerprint(data);
  const doc = await getSharedPdfDocument(data);
  if (signal?.aborted) return {};
  const results: Record<number, string> = {};

  for (let i = 0; i < pageNumbers.length; i += batchSize) {
    if (signal?.aborted) break;
    const chunk = pageNumbers.slice(i, i + batchSize);
    const batch: Record<number, string> = {};

    await Promise.all(
      chunk.map(async (pageNum) => {
        if (signal?.aborted) return;
        try {
          const url = await renderPageFromDocument(doc, pageNum, options, docKey);
          if (signal?.aborted) return;
          results[pageNum] = url;
          batch[pageNum] = url;
        } catch (e) {
          console.warn(`Thumbnail render failed for page ${pageNum}`, e);
        }
      })
    );

    if (signal?.aborted) break;
    if (Object.keys(batch).length > 0) {
      onBatch(batch);
    }
  }

  return results;
}
