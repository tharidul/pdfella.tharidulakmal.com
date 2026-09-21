import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";
import { downloadPdf } from "./download";

export type WatermarkType = "text" | "image";

export interface TextWatermarkOptions {
  type: "text";
  text: string;
  fontSize?: number;
  colorHex?: string;
  opacity?: number;
  rotation?: number; // In degrees, e.g. -45, 0, 45
  skipFirstPage?: boolean;
}

export interface ImageWatermarkOptions {
  type: "image";
  imageBuffer: ArrayBuffer | Uint8Array;
  isPng?: boolean;
  scale?: number;
  opacity?: number;
  rotation?: number;
  skipFirstPage?: boolean;
}

export type WatermarkOptions = TextWatermarkOptions | ImageWatermarkOptions;

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16) / 255 || 0;
  const g = parseInt(clean.substring(2, 4), 16) / 255 || 0;
  const b = parseInt(clean.substring(4, 6), 16) / 255 || 0;
  return rgb(r, g, b);
}

/**
 * Superimposes a text or image watermark onto pages of a PDF document
 */
export async function addWatermarkToPdf(
  data: ArrayBuffer | Uint8Array,
  options: WatermarkOptions
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(data);
  const pages = pdfDoc.getPages();
  const opacity = Math.max(0.05, Math.min(1.0, options.opacity ?? 0.25));
  const rotationDeg = options.rotation ?? -45;

  if (options.type === "text") {
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontSize = options.fontSize ?? 48;
    const text = options.text.trim() || "CONFIDENTIAL";
    const color = options.colorHex ? hexToRgb(options.colorHex) : rgb(0.8, 0.1, 0.1);

    const textWidth = font.widthOfTextAtSize(text, fontSize);
    const textHeight = font.heightAtSize(fontSize);
    const rad = (rotationDeg * Math.PI) / 180;

    for (let i = 0; i < pages.length; i++) {
      if (i === 0 && options.skipFirstPage) continue;

      const page = pages[i]!;
      const { width, height } = page.getSize();
      const cx = width / 2;
      const cy = height / 2;

      // Compute offset to position the center of the rotated text exactly at page center
      const dx = (textWidth / 2) * Math.cos(rad) - (textHeight / 2) * Math.sin(rad);
      const dy = (textWidth / 2) * Math.sin(rad) + (textHeight / 2) * Math.cos(rad);

      page.drawText(text, {
        x: cx - dx,
        y: cy - dy,
        size: fontSize,
        font,
        color,
        opacity,
        rotate: degrees(rotationDeg),
      });
    }
  } else {
    const embeddedImage = options.isPng
      ? await pdfDoc.embedPng(options.imageBuffer)
      : await pdfDoc.embedJpg(options.imageBuffer);

    const baseScale = Math.max(0.1, Math.min(1.0, options.scale ?? 0.5));
    const rad = (rotationDeg * Math.PI) / 180;
    const imgAspect = embeddedImage.width / embeddedImage.height;

    for (let i = 0; i < pages.length; i++) {
      if (i === 0 && options.skipFirstPage) continue;

      const page = pages[i]!;
      const { width, height } = page.getSize();
      const cx = width / 2;
      const cy = height / 2;

      // Scale proportionally to page size rather than raw pixels
      const targetMaxWidth = width * baseScale;
      const targetMaxHeight = height * baseScale;

      let imgWidth = targetMaxWidth;
      let imgHeight = imgWidth / imgAspect;

      if (imgHeight > targetMaxHeight) {
        imgHeight = targetMaxHeight;
        imgWidth = imgHeight * imgAspect;
      }

      const dx = (imgWidth / 2) * Math.cos(rad) - (imgHeight / 2) * Math.sin(rad);
      const dy = (imgWidth / 2) * Math.sin(rad) + (imgHeight / 2) * Math.cos(rad);

      page.drawImage(embeddedImage, {
        x: cx - dx,
        y: cy - dy,
        width: imgWidth,
        height: imgHeight,
        opacity,
        rotate: degrees(rotationDeg),
      });
    }
  }

  return pdfDoc.save();
}

/**
 * Adds watermark and triggers browser download
 */
export async function addWatermarkAndDownload(
  data: ArrayBuffer | Uint8Array,
  baseFileName: string,
  options: WatermarkOptions
): Promise<void> {
  const pdfBytes = await addWatermarkToPdf(data, options);
  const cleanBase = baseFileName.replace(/\.[^/.]+$/, "");
  downloadPdf(pdfBytes, `${cleanBase}_watermarked.pdf`);
}
