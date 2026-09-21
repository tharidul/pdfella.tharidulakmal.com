import type { PageThumbnailOptions } from "./types";

/**
 * Concurrency limiter to prevent hundreds of canvases from rendering simultaneously
 */
class ConcurrencyQueue {
  private activeCount = 0;
  private queue: Array<() => Promise<void>> = [];
  private readonly maxConcurrency: number;

  constructor(maxConcurrency = 3) {
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

const renderQueue = new ConcurrencyQueue(3);

/**
 * Simple in-memory thumbnail cache to avoid re-rendering pages during reorders or tab switching
 */
const thumbnailCache = new Map<string, string>();

/**
 * Clear thumbnail cache for memory cleanup when documents are unloaded
 */
export function clearThumbnailCache(): void {
  thumbnailCache.clear();
  renderQueue.clear();
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
 * Render a specific page of a PDF document to an image data URL
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
  const cacheKey = `${data.byteLength}-${pageNumber}-${options.width ?? 150}-${options.height ?? 200}`;
  const cached = thumbnailCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  return renderQueue.run(async () => {
    // Check cache again in case another queue job completed it
    const existing = thumbnailCache.get(cacheKey);
    if (existing) return existing;

    const pdfjs = await getPdfJs();
    const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);

    // Load document with typed data clone to prevent detached array buffer errors
    const loadingTask = pdfjs.getDocument({
      data: bytes.slice(),
      disableFontFace: false,
    });

    const doc = await loadingTask.promise;

    try {
      const page = await doc.getPage(pageNumber);

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
      await doc.cleanup();
      await loadingTask.destroy();
    }
  });
}
