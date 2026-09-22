import { loadPdfLib } from "./loader";
import { downloadPdf } from "./download";

export type ImagePageSize = "fit" | "a4" | "letter";
export type ImageOrientation = "auto" | "portrait" | "landscape";
export type ImageMargin = "none" | "small" | "large";

export interface ImageToPdfOptions {
  pageSize: ImagePageSize;
  orientation: ImageOrientation;
  margin: ImageMargin;
  onProgress?: (current: number, total: number) => void;
}

export interface ImageItem {
  id: string;
  file: File;
  name: string;
  size: number;
  previewUrl: string;
  width?: number;
  height?: number;
}

const PAGE_DIMENSIONS = {
  a4: { width: 595.28, height: 841.89 },
  letter: { width: 612.0, height: 792.0 },
};

const MARGIN_SIZES = {
  none: 0,
  small: 20,
  large: 40,
};

async function processImageToBytes(
  file: File
): Promise<{ bytes: Uint8Array; width: number; height: number; isPng: boolean }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`Failed to read image file: ${file.name}`));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error(`Invalid image data in file: ${file.name}`));
      img.onload = () => {
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Unable to create canvas context."));
          return;
        }

        const isPng = file.type === "image/png";

        if (!isPng) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = isPng ? "image/png" : "image/jpeg";
        const quality = isPng ? undefined : 0.92;

        canvas.toBlob(
          async (blob) => {
            if (!blob) {
              reject(new Error("Failed to export image blob."));
              return;
            }
            const buffer = await blob.arrayBuffer();
            resolve({
              bytes: new Uint8Array(buffer),
              width,
              height,
              isPng,
            });
          },
          mimeType,
          quality
        );
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export async function convertImagesToPdf(
  images: File[],
  options: ImageToPdfOptions
): Promise<Uint8Array> {
  if (images.length === 0) {
    throw new Error("Please select at least one image to convert.");
  }

  const { PDFDocument } = await loadPdfLib();
  const pdfDoc = await PDFDocument.create();
  const margin = MARGIN_SIZES[options.margin];

  for (let i = 0; i < images.length; i++) {
    const file = images[i]!;
    options.onProgress?.(i + 1, images.length);

    const { bytes, width: imgW, height: imgH, isPng } = await processImageToBytes(file);

    const embeddedImage = isPng
      ? await pdfDoc.embedPng(bytes)
      : await pdfDoc.embedJpg(bytes);

    let pageWidth = imgW;
    let pageHeight = imgH;

    if (options.pageSize === "fit") {
      pageWidth = imgW + margin * 2;
      pageHeight = imgH + margin * 2;

      const page = pdfDoc.addPage([pageWidth, pageHeight]);
      page.drawImage(embeddedImage, {
        x: margin,
        y: margin,
        width: imgW,
        height: imgH,
      });
    } else {
      const standard = PAGE_DIMENSIONS[options.pageSize];
      const isImageLandscape = imgW > imgH;

      let isLandscape = false;
      if (options.orientation === "auto") {
        isLandscape = isImageLandscape;
      } else if (options.orientation === "landscape") {
        isLandscape = true;
      }

      pageWidth = isLandscape
        ? Math.max(standard.width, standard.height)
        : Math.min(standard.width, standard.height);
      pageHeight = isLandscape
        ? Math.min(standard.width, standard.height)
        : Math.max(standard.width, standard.height);

      const availW = Math.max(1, pageWidth - margin * 2);
      const availH = Math.max(1, pageHeight - margin * 2);

      const scale = Math.min(availW / imgW, availH / imgH);
      const drawW = imgW * scale;
      const drawH = imgH * scale;

      const x = margin + (availW - drawW) / 2;
      const y = margin + (availH - drawH) / 2;

      const page = pdfDoc.addPage([pageWidth, pageHeight]);
      page.drawImage(embeddedImage, {
        x,
        y,
        width: drawW,
        height: drawH,
      });
    }
  }

  return pdfDoc.save();
}

export async function convertImagesAndDownload(
  images: File[],
  options: ImageToPdfOptions,
  filename?: string
): Promise<void> {
  const pdfBytes = await convertImagesToPdf(images, options);
  const now = new Date().toISOString().slice(0, 10);
  const outName = filename ?? `images-converted-${now}.pdf`;
  downloadPdf(pdfBytes, outName);
}
