import { getPdfJs } from "./render";
import { createZipArchive, type ZipFileEntry } from "./zip";
import { triggerDownload } from "./download";

export type ImageFormat = "png" | "jpeg";
export type ImageResolution = "standard" | "high";

export interface PdfToImageOptions {
  format: ImageFormat;
  resolution: ImageResolution;
  quality?: number;
  selectedPages?: number[];
  onProgress?: (current: number, total: number) => void;
}

export interface RenderedPageImage {
  pageNumber: number;
  dataUrl: string;
  blob: Blob;
  width: number;
  height: number;
}

const RESOLUTION_SCALES = {
  standard: 1.5,
  high: 2.5,
};

export async function renderPdfPageToImage(
  data: ArrayBuffer | Uint8Array,
  pageNumber: number,
  options: {
    format: ImageFormat;
    scale: number;
    quality?: number;
  }
): Promise<RenderedPageImage> {
  const pdfjs = await getPdfJs();
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);

  const loadingTask = pdfjs.getDocument({
    data: bytes.slice(),
    disableFontFace: false,
  });

  const doc = await loadingTask.promise;

  try {
    const page = await doc.getPage(pageNumber);
    const viewport = page.getViewport({ scale: options.scale });

    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) {
      throw new Error("Unable to create canvas context.");
    }

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({
      canvas,
      canvasContext: ctx,
      viewport,
    }).promise;

    const mimeType = options.format === "png" ? "image/png" : "image/jpeg";
    const quality = options.format === "png" ? undefined : options.quality ?? 0.92;

    const dataUrl = canvas.toDataURL(mimeType, quality);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (b) resolve(b);
          else reject(new Error(`Failed to convert page ${pageNumber} to image blob.`));
        },
        mimeType,
        quality
      );
    });

    return {
      pageNumber,
      dataUrl,
      blob,
      width: canvas.width,
      height: canvas.height,
    };
  } finally {
    await doc.cleanup();
    await loadingTask.destroy();
  }
}

export async function convertPdfToImagesZip(
  data: ArrayBuffer | Uint8Array,
  baseFileName: string,
  options: PdfToImageOptions
): Promise<void> {
  const scale = RESOLUTION_SCALES[options.resolution];
  const pages = options.selectedPages ?? [1];
  const total = pages.length;

  const zipEntries: ZipFileEntry[] = [];
  const cleanBase = baseFileName.replace(/\.[^/.]+$/, "");
  const extension = options.format === "png" ? "png" : "jpg";

  for (let i = 0; i < pages.length; i++) {
    const pageNum = pages[i]!;
    options.onProgress?.(i + 1, total);

    const rendered = await renderPdfPageToImage(data, pageNum, {
      format: options.format,
      scale,
      quality: options.quality,
    });

    const buffer = await rendered.blob.arrayBuffer();
    const formattedNum = String(pageNum).padStart(3, "0");
    const imageName = `${cleanBase}_page_${formattedNum}.${extension}`;

    zipEntries.push({
      name: imageName,
      data: new Uint8Array(buffer),
    });
  }

  const zipData = createZipArchive(zipEntries);
  triggerDownload(zipData, `${cleanBase}_images.zip`, "application/zip");
}

export function downloadSinglePageImage(
  rendered: RenderedPageImage,
  baseFileName: string,
  format: ImageFormat
): void {
  const cleanBase = baseFileName.replace(/\.[^/.]+$/, "");
  const ext = format === "png" ? "png" : "jpg";
  const num = String(rendered.pageNumber).padStart(3, "0");
  const fileName = `${cleanBase}_page_${num}.${ext}`;
  const mimeType = format === "png" ? "image/png" : "image/jpeg";

  triggerDownload(rendered.blob, fileName, mimeType);
}
