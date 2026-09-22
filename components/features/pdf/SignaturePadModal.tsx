"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  HiXMark,
  HiArrowUturnLeft,
  HiTrash,
  HiCheck,
  HiPencil,
  HiOutlineDocumentText,
  HiArrowUpTray,
  HiArrowDownTray,
} from "react-icons/hi2";
import { getStroke, type StrokeOptions } from "perfect-freehand";
import { downloadSignatureImage } from "@/lib/pdf/sign";

export interface SignaturePadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dataUrl: string, label: string) => void;
}

type TabType = "draw" | "type" | "upload";

export type PenStyle = "fountain" | "ballpoint" | "gel";

interface StrokePoint {
  x: number;
  y: number;
  time: number;
  pressure?: number;
}

interface Stroke {
  points: StrokePoint[];
  color: string;
  baseWidth: number;
  penStyle: PenStyle;
  isComplete?: boolean;
}

const INK_COLORS = [
  { label: "Classic Black", value: "#000000" },
  { label: "Fountain Blue", value: "#1e3a8a" },
  { label: "Seal Burgundy", value: "#800020" },
];

const STROKE_WIDTHS = [
  { label: "Fine", value: 3 },
  { label: "Medium", value: 4.5 },
  { label: "Bold", value: 7 },
];

const PEN_STYLES: {
  id: PenStyle;
  label: string;
}[] = [
  { id: "fountain", label: "Fountain" },
  { id: "ballpoint", label: "Ballpoint" },
  { id: "gel", label: "Gel" },
];

const CURSIVE_FONTS = [
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

/**
 * Converts outline points into a smooth, curved SVG path (using quadratic Bézier midpoint interpolation)
 */
function getSvgPathFromStroke(stroke: number[][], closed = true): string {
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

/**
 * Returns tailored stroke dynamics and tapering profiles for each pen style
 */
function getPenOptions(penStyle: PenStyle, baseWidth: number, isComplete: boolean): StrokeOptions {
  switch (penStyle) {
    case "fountain":
      // Fountain Pen: Calligraphic variation with tapered hairline flourishes and rich downstrokes
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
      // Ballpoint: Steady, crisp rollerball line with subtle natural speed response
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
      // Gel Pen: Rich liquid ink flow with juicy rounded curves and smooth taper
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

/**
 * Renders a stroke using pressure-sensitive outline polygons and smooth start/end tapering
 */
function renderStroke(ctx: CanvasRenderingContext2D, stroke: Stroke) {
  const points = stroke.points;
  if (points.length === 0) return;

  ctx.fillStyle = stroke.color;

  // Single dot (click / tap without dragging)
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

/**
 * Trims transparent border pixels from canvas to avoid oversized bounding boxes
 */
function getCroppedCanvasDataUrl(canvas: HTMLCanvasElement): string {
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

  // Add a neat breathing margin of 24px
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

export function SignaturePadModal({ isOpen, onClose, onSave }: SignaturePadModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("draw");

  // Draw state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("#000000");
  const [selectedWidth, setSelectedWidth] = useState<number>(4.5);
  const [selectedPenStyle, setSelectedPenStyle] = useState<PenStyle>("fountain");

  const isDrawingRef = useRef(false);

  // Type state
  const [typedText, setTypedText] = useState("John Doe");
  const [selectedFont, setSelectedFont] = useState(CURSIVE_FONTS[0]!.id);
  const [typeColor, setTypeColor] = useState("#000000");

  // Upload state
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [makeTransparent, setMakeTransparent] = useState(true);
  const [isDraggingUpload, setIsDraggingUpload] = useState(false);
  const uploadDragCounterRef = useRef(0);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  // Handle keyboard shortcuts (Escape to close, Ctrl+Z to undo)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z" && activeTab === "draw") {
        e.preventDefault();
        setStrokes((prev) => prev.slice(0, -1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, activeTab]);

  // Redraw canvas whenever strokes change with smooth bezier curve interpolation
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const allStrokes = currentStroke ? [...strokes, currentStroke] : strokes;

    for (const stroke of allStrokes) {
      renderStroke(ctx, stroke);
    }
  }, [strokes, currentStroke]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Accurate pointer coordinates scaled to canvas resolution
  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    isDrawingRef.current = true;
    const coords = getCanvasCoords(e);
    const now = performance.now();
    const pressure = e.pressure && e.pressure > 0 ? e.pressure : 0.5;

    const firstPoint: StrokePoint = {
      x: coords.x,
      y: coords.y,
      time: now,
      pressure,
    };

    setCurrentStroke({
      points: [firstPoint],
      color: selectedColor,
      baseWidth: selectedWidth,
      penStyle: selectedPenStyle,
      isComplete: false,
    });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !currentStroke) return;
    e.preventDefault();

    const coords = getCanvasCoords(e);
    const now = performance.now();
    const lastPt = currentStroke.points[currentStroke.points.length - 1];
    if (!lastPt) return;

    const dx = coords.x - lastPt.x;
    const dy = coords.y - lastPt.y;
    const dist = Math.hypot(dx, dy);

    // Responsive threshold so even fine micro-loops register naturally
    if (dist < 1.2) return;

    const pressure = e.pressure && e.pressure > 0 ? e.pressure : 0.5;

    const newPt: StrokePoint = {
      x: coords.x,
      y: coords.y,
      time: now,
      pressure,
    };

    setCurrentStroke((prev) => (prev ? { ...prev, points: [...prev.points, newPt] } : null));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    e.preventDefault();
    isDrawingRef.current = false;

    if (currentStroke && currentStroke.points.length > 0) {
      const coords = getCanvasCoords(e);
      const lastPt = currentStroke.points[currentStroke.points.length - 1]!;
      const dist = Math.hypot(coords.x - lastPt.x, coords.y - lastPt.y);

      let finalPoints = currentStroke.points;
      if (dist >= 1.5) {
        finalPoints = [
          ...finalPoints,
          {
            x: coords.x,
            y: coords.y,
            time: performance.now(),
            pressure: e.pressure && e.pressure > 0 ? e.pressure : 0.5,
          },
        ];
      }

      setStrokes((prev) => [
        ...prev,
        {
          ...currentStroke,
          points: finalPoints,
          isComplete: true,
        },
      ]);
    }
    setCurrentStroke(null);
  };

  const handleUndo = () => {
    setStrokes((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setStrokes([]);
    setCurrentStroke(null);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Convert uploaded image and apply transparency filter if checked
  const processUploadedImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (!makeTransparent) {
        setUploadedImageUrl(result);
        return;
      }

      // Filter near-white background
      const img = new Image();
      img.onload = () => {
        const offscreen = document.createElement("canvas");
        offscreen.width = img.naturalWidth;
        offscreen.height = img.naturalHeight;
        const ctx = offscreen.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
          setUploadedImageUrl(result);
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, offscreen.width, offscreen.height);
        const data = imgData.data;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i] ?? 0;
          const g = data[i + 1] ?? 0;
          const b = data[i + 2] ?? 0;
          // If pixel is near-white (brightness > 220), set opacity to 0
          if (r > 220 && g > 220 && b > 220) {
            data[i + 3] = 0;
          }
        }

        ctx.putImageData(imgData, 0, 0);
        const cropped = getCroppedCanvasDataUrl(offscreen);
        setUploadedImageUrl(cropped);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  // Generate cropped transparent PNG from typed text
  const generateTypedPng = (): string => {
    const offscreen = document.createElement("canvas");
    offscreen.width = 900;
    offscreen.height = 300;
    const ctx = offscreen.getContext("2d", { willReadFrequently: true });
    if (!ctx) return "";

    const fontItem = CURSIVE_FONTS.find((f) => f.id === selectedFont) ?? CURSIVE_FONTS[0]!;
    ctx.font = `italic 72px ${fontItem.fontFamily}`;
    ctx.fillStyle = typeColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(typedText || "Signature", 450, 150);

    return getCroppedCanvasDataUrl(offscreen);
  };

  // Extract active signature as cropped data URL
  const getActiveSignatureDataUrl = (): string | null => {
    if (activeTab === "draw") {
      const canvas = canvasRef.current;
      if (!canvas || strokes.length === 0) return null;
      return getCroppedCanvasDataUrl(canvas);
    } else if (activeTab === "type") {
      if (!typedText.trim()) return null;
      return generateTypedPng();
    } else if (activeTab === "upload") {
      return uploadedImageUrl;
    }
    return null;
  };

  const handleDownloadSignature = (background: "transparent" | "white") => {
    const dataUrl = getActiveSignatureDataUrl();
    if (!dataUrl) return;

    const baseName =
      activeTab === "type" && typedText.trim()
        ? `signature-${typedText.trim().toLowerCase().replace(/[^a-z0-9]/g, "-")}`
        : "signature";

    downloadSignatureImage(dataUrl, background, baseName);
  };

  // Export and submit signature
  const handleSaveSignature = () => {
    const dataUrl = getActiveSignatureDataUrl();
    if (!dataUrl) return;

    // Reset state so next signature opens clean
    setStrokes([]);
    setCurrentStroke(null);

    const label =
      activeTab === "type"
        ? `Signature (${typedText})`
        : activeTab === "upload"
        ? "Signature (Upload)"
        : "Signature";

    onSave(dataUrl, label);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      {/* Modal Container: Enlarged for comfortable signing */}
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-neutral-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-neutral-900">Create Signature</h3>
            <p className="text-xs text-neutral-600 mt-0.5">
              Draw, type, or upload your signature. All processing is 100% private in your browser.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 transition-colors cursor-pointer"
          >
            <HiXMark className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-200 bg-neutral-50 px-6 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab("draw")}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition-colors cursor-pointer ${
              activeTab === "draw"
                ? "border-brand-primary text-brand-primary"
                : "border-transparent text-neutral-600 hover:text-neutral-900"
            }`}
          >
            <HiPencil className="w-4 h-4" />
            Draw Signature
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("type")}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition-colors cursor-pointer ${
              activeTab === "type"
                ? "border-brand-primary text-brand-primary"
                : "border-transparent text-neutral-600 hover:text-neutral-900"
            }`}
          >
            <HiOutlineDocumentText className="w-4 h-4" />
            Type Signature
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition-colors cursor-pointer ${
              activeTab === "upload"
                ? "border-brand-primary text-brand-primary"
                : "border-transparent text-neutral-600 hover:text-neutral-900"
            }`}
          >
            <HiArrowUpTray className="w-4 h-4" />
            Upload Scan
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* 1. DRAW TAB: Large, Spacious Signing Area */}
          {activeTab === "draw" && (
            <div className="space-y-4">
              <div className="relative rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-2xs">
                {/* Visual Signing Baseline Guide */}
                <div className="pointer-events-none absolute bottom-12 inset-x-8 flex items-center gap-3">
                  <span className="text-sm font-bold text-neutral-400 select-none">✕</span>
                  <div className="h-px flex-1 border-b border-neutral-200" />
                  <span className="text-[11px] font-medium text-neutral-400 select-none tracking-wider uppercase">
                    Sign on line
                  </span>
                </div>

                {/* High-Resolution HTML5 Drawing Canvas (1200 x 480) */}
                <canvas
                  ref={canvasRef}
                  width={1200}
                  height={480}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  className="h-64 sm:h-72 w-full cursor-crosshair touch-none bg-transparent"
                />

                {strokes.length === 0 && !currentStroke && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs font-medium text-neutral-400 select-none">
                    Click or touch here to write your signature
                  </div>
                )}
              </div>

              {/* Draw Controls Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                {/* Left: Pen Style, Ink Color & Thickness */}
                <div className="flex flex-wrap items-center gap-4">
                  {/* Pen Style */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-neutral-600">Pen:</span>
                    <div className="flex items-center rounded-lg border border-neutral-200 bg-neutral-100 p-0.5">
                      {PEN_STYLES.map((pen) => (
                        <button
                          key={pen.id}
                          type="button"
                          onClick={() => setSelectedPenStyle(pen.id)}
                          className={`px-3 py-1 text-xs rounded-md font-medium transition-all cursor-pointer ${
                            selectedPenStyle === pen.id
                              ? "bg-white text-neutral-900 shadow-2xs font-semibold"
                              : "text-neutral-600 hover:text-neutral-900"
                          }`}
                        >
                          {pen.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Ink Color Selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-neutral-600">Color:</span>
                    <div className="flex items-center gap-1.5">
                      {INK_COLORS.map((c) => (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => setSelectedColor(c.value)}
                          title={c.label}
                          className={`w-6 h-6 rounded-full border transition-all cursor-pointer ${
                            selectedColor === c.value
                              ? "scale-110 ring-2 ring-offset-2 ring-neutral-400 border-white shadow-2xs"
                              : "border-neutral-300 hover:scale-105"
                          }`}
                          style={{ backgroundColor: c.value }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Stroke Width Selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-neutral-600">Thickness:</span>
                    <div className="flex items-center rounded-lg border border-neutral-200 bg-neutral-100 p-0.5">
                      {STROKE_WIDTHS.map((w) => (
                        <button
                          key={w.value}
                          type="button"
                          onClick={() => setSelectedWidth(w.value)}
                          className={`px-3 py-1 text-xs rounded-md font-medium transition-all cursor-pointer ${
                            selectedWidth === w.value
                              ? "bg-white text-neutral-900 shadow-2xs font-semibold"
                              : "text-neutral-600 hover:text-neutral-900"
                          }`}
                        >
                          {w.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Undo / Clear Buttons */}
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={handleUndo}
                    disabled={strokes.length === 0}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <HiArrowUturnLeft className="w-3.5 h-3.5" />
                    <span>Undo</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleClear}
                    disabled={strokes.length === 0}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:text-brand-primary hover:border-neutral-300 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <HiTrash className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. TYPE TAB: Handwriting Text Generator */}
          {activeTab === "type" && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  Type your name or initials:
                </label>
                <input
                  type="text"
                  value={typedText}
                  onChange={(e) => setTypedText(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-base text-neutral-900 shadow-2xs focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                />
              </div>

              {/* Font Style Options */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-2">
                  Select Handwriting Style:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {CURSIVE_FONTS.map((font) => (
                    <button
                      key={font.id}
                      type="button"
                      onClick={() => setSelectedFont(font.id)}
                      className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${
                        selectedFont === font.id
                          ? "border-brand-primary bg-brand-subtle text-brand-primary ring-2 ring-brand-border shadow-xs"
                          : "border-neutral-200 hover:border-neutral-300 bg-white text-neutral-800"
                      }`}
                    >
                      <div
                        className="text-2xl leading-tight truncate py-2"
                        style={{ fontFamily: font.fontFamily, color: typeColor }}
                      >
                        {typedText || "Signature"}
                      </div>
                      <span className="text-[11px] text-neutral-500 block mt-1 font-medium">
                        {font.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Ink Color Picker */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs font-semibold text-neutral-600">Ink Color:</span>
                <div className="flex items-center gap-1.5">
                  {INK_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setTypeColor(c.value)}
                      title={c.label}
                      className={`w-7 h-7 rounded-full border transition-transform cursor-pointer ${
                        typeColor === c.value
                          ? "scale-110 ring-2 ring-offset-2 ring-neutral-400 border-white"
                          : "border-neutral-300 hover:scale-105"
                      }`}
                      style={{ backgroundColor: c.value }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 3. UPLOAD TAB: Scanned Signature Image */}
          {activeTab === "upload" && (
            <div className="space-y-4">
              <div
                onClick={() => uploadInputRef.current?.click()}
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  uploadDragCounterRef.current++;
                  if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
                    setIsDraggingUpload(true);
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  try {
                    e.dataTransfer.dropEffect = "copy";
                  } catch {
                    // Ignore
                  }
                  if (!isDraggingUpload) setIsDraggingUpload(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  uploadDragCounterRef.current--;
                  if (uploadDragCounterRef.current <= 0) {
                    uploadDragCounterRef.current = 0;
                    setIsDraggingUpload(false);
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  uploadDragCounterRef.current = 0;
                  setIsDraggingUpload(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) {
                    processUploadedImage(file);
                  }
                }}
                className={`w-full rounded-2xl p-8 text-center cursor-pointer transition-all duration-150 ${
                  isDraggingUpload
                    ? "border-2 border-solid border-brand-primary bg-brand-subtle ring-4 ring-brand-border shadow-sm"
                    : "border border-neutral-200 bg-neutral-50/40 hover:bg-neutral-50/90 hover:border-neutral-300 shadow-2xs"
                }`}
              >
                <input
                  ref={uploadInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) processUploadedImage(file);
                  }}
                />

                {uploadedImageUrl ? (
                  <div className="flex flex-col items-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={uploadedImageUrl}
                      alt="Signature preview"
                      className="max-h-36 object-contain rounded-lg border border-neutral-200 p-3 bg-white shadow-xs"
                    />
                    <span className="text-xs text-brand-primary font-bold mt-3">
                      Click to choose a different image
                    </span>
                  </div>
                ) : (
                  <div>
                    <HiArrowUpTray className="w-10 h-10 mx-auto text-neutral-400 mb-2.5" />
                    <p className="text-sm font-bold text-neutral-800">
                      Upload an image of your signature
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      Supports PNG, JPG, or WebP scans of handwritten signatures
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2.5 px-1">
                <input
                  id="make-transparent"
                  type="checkbox"
                  checked={makeTransparent}
                  onChange={(e) => setMakeTransparent(e.target.checked)}
                  className="w-4 h-4 rounded border-neutral-300 text-brand-primary focus:ring-brand-primary accent-brand-primary"
                />
                <label
                  htmlFor="make-transparent"
                  className="text-xs font-medium text-neutral-700 select-none cursor-pointer"
                >
                  Auto-remove white paper background (make signature transparent)
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex flex-wrap items-center justify-between border-t border-neutral-200 bg-neutral-50 px-6 py-4 gap-3">
          {/* Left: Download Signature as PNG (Transparent or White BG) */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-neutral-500 mr-1 hidden sm:inline">
              Download PNG:
            </span>

            <button
              type="button"
              onClick={() => handleDownloadSignature("transparent")}
              disabled={
                (activeTab === "draw" && strokes.length === 0) ||
                (activeTab === "type" && !typedText.trim()) ||
                (activeTab === "upload" && !uploadedImageUrl)
              }
              title="Download signature with transparent background (PNG)"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50 hover:border-neutral-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs cursor-pointer"
            >
              <HiArrowDownTray className="w-3.5 h-3.5 text-neutral-600" />
              <span>Transparent</span>
              <span className="text-[9px] bg-brand-subtle text-brand-primary px-1.5 py-0.5 rounded font-bold">
                Clear
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleDownloadSignature("white")}
              disabled={
                (activeTab === "draw" && strokes.length === 0) ||
                (activeTab === "type" && !typedText.trim()) ||
                (activeTab === "upload" && !uploadedImageUrl)
              }
              title="Download signature with solid white background (PNG)"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50 hover:border-neutral-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs cursor-pointer"
            >
              <HiArrowDownTray className="w-3.5 h-3.5 text-neutral-600" />
              <span>White BG</span>
              <span className="text-[9px] bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded font-bold">
                Solid
              </span>
            </button>
          </div>

          {/* Right: Cancel and Place */}
          <div className="flex items-center gap-3 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveSignature}
              disabled={
                (activeTab === "draw" && strokes.length === 0) ||
                (activeTab === "type" && !typedText.trim()) ||
                (activeTab === "upload" && !uploadedImageUrl)
              }
              className="flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-brand-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <HiCheck className="w-4 h-4" />
              <span>Place on Document</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
