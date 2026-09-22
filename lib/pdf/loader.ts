let pdfLibPromise: Promise<typeof import("pdf-lib")> | null = null;

export async function loadPdfLib(): Promise<typeof import("pdf-lib")> {
  if (!pdfLibPromise) {
    pdfLibPromise = import("pdf-lib");
  }
  return pdfLibPromise;
}
