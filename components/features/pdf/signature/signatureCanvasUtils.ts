import { getStroke, type StrokeOptions } from "perfect-freehand";

export type PenStyle = "fountain" | "ballpoint" | "gel";

export interface StrokePoint {
  x: number;
  y: number;
  time: number;
  pressure?: number;
}

export interface Stroke {
  points: StrokePoint[];
  color: string;
  baseWidth: number;
  penStyle: PenStyle;
  isComplete?: boolean;
}

export const INK_COLORS = [
  { label: "Classic Black", value: "#000000" },
  { label: "Fountain Blue", value: "#1e3a8a" },
  { label: "Seal Burgundy", value: "#800020" },
];

export const STROKE_WIDTHS = [
  { label: "Fine", value: 3 },
  { label: "Medium", value: 4.5 },
  { label: "Bold", value: 7 },
];

export const PEN_STYLES: {
  id: PenStyle;
  label: string;
}[] = [
  { id: "fountain", label: "Fountain" },
  { id: "ballpoint", label: "Ballpoint" },
  { id: "gel", label: "Gel" },
];

export const CURSIVE_FONTS = [
  {
    id: "style1",
    label: "Elegant Script",
    fontFamily: "'Dancing Script', 'Caveat', 'Segoe Script', cursive",
  },
  {
    id: "style2",
    label: "Classic Signature",
    fontFamily: "'Brush Script MT', 'Alex Brush', cursive",
  },
  {
    id: "style3",
    label: "Handwritten Casual",
    fontFamily: "'Caveat', 'Segoe Print', cursive",
  },
];

export function getSvgPathFromStroke(stroke: number[][], closed = true): string {
  const len = stroke.length;
  if (len < 4) return "";

  let a = stroke[0]!;
  let b = stroke[1]!;
  const c = stroke[2]!;

  let result = `M${a[0]!.toFixed(2)},${a[1]!.toFixed(2)} Q${b[0]!.toFixed(
    2
  )},${b[1]!.toFixed(2)} ${((b[0]! + c[0]!) / 2).toFixed(2)},${((b[1]! + c[1]!) / 2).toFixed(
    2
  )} T`;

  for (let i = 2, max = len - 1; i < max; i++) {
    a = stroke[i]!;
    b = stroke[i + 1]!;
    result += `${((a[0]! + b[0]!) / 2).toFixed(2)},${((a[1]! + b[1]!) / 2).toFixed(2)} `;
  }

  if (closed) {
    result += "Z";
  }

  return result;
}

export function getPenOptions(penStyle: PenStyle, baseWidth: number, isComplete: boolean): StrokeOptions {
  switch (penStyle) {
    case "fountain":
      return {
        size: baseWidth * 2.3,
        thinning: 0.72,
        smoothing: 0.58,
        streamline: 0.45,
        simulatePressure: true,
        last: isComplete,
        start: {
          taper: 18,
          cap: true,
        },
        end: {
          taper: isComplete ? 30 : 0,
          cap: true,
        },
      };

    case "ballpoint":
      return {
        size: baseWidth * 1.8,
        thinning: 0.28,
        smoothing: 0.5,
        streamline: 0.35,
        simulatePressure: true,
        last: isComplete,
        start: {
          taper: 8,
          cap: true,
        },
        end: {
          taper: isComplete ? 14 : 0,
          cap: true,
        },
      };

    case "gel":
      return {
        size: baseWidth * 2.4,
        thinning: 0.48,
        smoothing: 0.65,
        streamline: 0.5,
        simulatePressure: true,
        last: isComplete,
        start: {
          taper: 14,
          cap: true,
        },
        end: {
          taper: isComplete ? 20 : 0,
          cap: true,
        },
      };
  }
}

export function renderStroke(ctx: CanvasRenderingContext2D, stroke: Stroke): void {
  const points = stroke.points;
  if (points.length === 0) return;

  ctx.fillStyle = stroke.color;

  if (points.length === 1) {
    const pt = points[0]!;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, stroke.baseWidth * 0.9, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  const options = getPenOptions(stroke.penStyle, stroke.baseWidth, stroke.isComplete ?? true);
  const inputPoints = points.map((p) => [p.x, p.y, p.pressure ?? 0.5]);
  const outlinePoints = getStroke(inputPoints, options);

  if (outlinePoints.length === 0) return;

  const pathData = getSvgPathFromStroke(outlinePoints);
  if (pathData) {
    const path = new Path2D(pathData);
    ctx.fill(path);
  } else if (outlinePoints.length >= 2) {
    ctx.beginPath();
    ctx.moveTo(outlinePoints[0]![0]!, outlinePoints[0]![1]!);
    for (let i = 1; i < outlinePoints.length; i++) {
      ctx.lineTo(outlinePoints[i]![0]!, outlinePoints[i]![1]!);
    }
    ctx.closePath();
    ctx.fill();
  }
}

export function getCroppedCanvasDataUrl(canvas: HTMLCanvasElement): string {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return canvas.toDataURL("image/png");

  const width = canvas.width;
  const height = canvas.height;
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  let hasPixels = false;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alphaIndex = (y * width + x) * 4 + 3;
      if ((data[alphaIndex] ?? 0) > 15) {
        hasPixels = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (!hasPixels) return canvas.toDataURL("image/png");

  const padding = 24;
  const cropX = Math.max(0, minX - padding);
  const cropY = Math.max(0, minY - padding);
  const cropW = Math.min(width - cropX, maxX - minX + padding * 2);
  const cropH = Math.min(height - cropY, maxY - minY + padding * 2);

  const croppedCanvas = document.createElement("canvas");
  croppedCanvas.width = Math.max(10, cropW);
  croppedCanvas.height = Math.max(10, cropH);
  const croppedCtx = croppedCanvas.getContext("2d");
  if (!croppedCtx) return canvas.toDataURL("image/png");

  croppedCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
  return croppedCanvas.toDataURL("image/png");
}

export function generateTypedPng(
  text: string,
  fontId: string,
  color: string
): string {
  const offscreen = document.createElement("canvas");
  offscreen.width = 900;
  offscreen.height = 300;
  const ctx = offscreen.getContext("2d", { willReadFrequently: true });
  if (!ctx) return "";

  const fontItem = CURSIVE_FONTS.find((f) => f.id === fontId) ?? CURSIVE_FONTS[0]!;
  ctx.font = `italic 72px ${fontItem.fontFamily}`;
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillText(text || "Signature", 450, 150);

  return getCroppedCanvasDataUrl(offscreen);
}

export function filterWhiteBackgroundToTransparent(
  imageUrl: string,
  onResult: (transparentUrl: string) => void
): void {
  const img = new Image();
  img.onload = () => {
    const offscreen = document.createElement("canvas");
    offscreen.width = img.naturalWidth;
    offscreen.height = img.naturalHeight;
    const ctx = offscreen.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      onResult(imageUrl);
      return;
    }

    ctx.drawImage(img, 0, 0);
    const imgData = ctx.getImageData(0, 0, offscreen.width, offscreen.height);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i] ?? 0;
      const g = data[i + 1] ?? 0;
      const b = data[i + 2] ?? 0;
      if (r > 220 && g > 220 && b > 220) {
        data[i + 3] = 0;
      }
    }

    ctx.putImageData(imgData, 0, 0);
    const cropped = getCroppedCanvasDataUrl(offscreen);
    onResult(cropped);
  };
  img.src = imageUrl;
}
