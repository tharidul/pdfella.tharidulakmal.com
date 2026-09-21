let pdfLibPromise: Promise<typeof import("pdf-lib")> | null = null;

/**
 * Lazily loads the pdf-lib library and caches the import promise.
 * Keeps initial client bundles lightweight until PDF operations are triggered.
 */
export async function loadPdfLib(): Promise<typeof import("pdf-lib")> {
  if (!pdfLibPromise) {
    pdfLibPromise = import("pdf-lib");
  }
  return pdfLibPromise;
}
