"use client";

import { useRef, useEffect, useCallback } from "react";
import { HiArrowUturnLeft, HiTrash } from "react-icons/hi2";
import {
  type PenStyle,
  type Stroke,
  type StrokePoint,
  INK_COLORS,
  STROKE_WIDTHS,
  PEN_STYLES,
  renderStroke,
} from "./signatureCanvasUtils";

export interface DrawSignatureTabProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  strokes: Stroke[];
  setStrokes: React.Dispatch<React.SetStateAction<Stroke[]>>;
  currentStroke: Stroke | null;
  setCurrentStroke: React.Dispatch<React.SetStateAction<Stroke | null>>;
  selectedColor: string;
  setSelectedColor: (c: string) => void;
  selectedWidth: number;
  setSelectedWidth: (w: number) => void;
  selectedPenStyle: PenStyle;
  setSelectedPenStyle: (s: PenStyle) => void;
}

export function DrawSignatureTab({
  canvasRef,
  strokes,
  setStrokes,
  currentStroke,
  setCurrentStroke,
  selectedColor,
  setSelectedColor,
  selectedWidth,
  setSelectedWidth,
  selectedPenStyle,
  setSelectedPenStyle,
}: DrawSignatureTabProps) {
  const isDrawingRef = useRef(false);

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
  }, [canvasRef, strokes, currentStroke]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

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

  return (
    <div className="space-y-4">
      <div className="relative rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-2xs">
        <div className="pointer-events-none absolute bottom-12 inset-x-8 flex items-center gap-3">
          <span className="text-sm font-bold text-neutral-400 select-none">✕</span>
          <div className="h-px flex-1 border-b border-neutral-200" />
          <span className="text-[11px] font-medium text-neutral-400 select-none tracking-wider uppercase">
            Sign on line
          </span>
        </div>

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

      <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
        <div className="flex flex-wrap items-center gap-4">
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
  );
}
