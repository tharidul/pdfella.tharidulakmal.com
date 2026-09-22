"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { HiTrash, HiArrowDownTray } from "react-icons/hi2";
import { RxDragHandleDots2 } from "react-icons/rx";
import { downloadSignatureImage, type SignaturePlacement } from "@/lib/pdf/sign";

export interface SignaturePlacementOverlayProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  placements: SignaturePlacement[];
  activePageNumber: number;
  selectedId: string | null;
  onSelectPlacement: (id: string | null) => void;
  onUpdatePlacement: (
    id: string,
    updates: Partial<Pick<SignaturePlacement, "xPercent" | "yPercent" | "widthPercent" | "heightPercent">>
  ) => void;
  onDeletePlacement: (id: string) => void;
}

type ResizeCorner = "tl" | "tr" | "bl" | "br";

interface DragTracking {
  id: string;
  startX: number;
  startY: number;
  initialXPercent: number;
  initialYPercent: number;
  widthPercent: number;
  heightPercent: number;
  deltaX: number;
  deltaY: number;
}

interface ResizeTracking {
  id: string;
  corner: ResizeCorner;
  startX: number;
  startY: number;
  initialXPosPx: number;
  initialYPosPx: number;
  initialWidthPx: number;
  initialHeightPx: number;
  aspectRatio: number;
}

interface LiveResize {
  id: string;
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  heightPercent: number;
}

export function SignaturePlacementOverlay({
  containerRef,
  placements,
  activePageNumber,
  selectedId,
  onSelectPlacement,
  onUpdatePlacement,
  onDeletePlacement,
}: SignaturePlacementOverlayProps) {
  // Live GPU-accelerated drag translation (bypasses heavy parent re-renders while dragging)
  const [liveDragOffset, setLiveDragOffset] = useState<{ id: string; deltaX: number; deltaY: number } | null>(null);
  const dragStateRef = useRef<DragTracking | null>(null);

  // Live resize state during active drag-resize
  const [liveResize, setLiveResize] = useState<LiveResize | null>(null);
  const liveResizeRef = useRef<LiveResize | null>(null);
  const resizeStateRef = useRef<ResizeTracking | null>(null);

  // Download format menu popover state
  const [activeDownloadMenuId, setActiveDownloadMenuId] = useState<string | null>(null);

  const activePlacements = placements.filter((p) => p.pageNumber === activePageNumber);

  // Close download menu on outside click
  useEffect(() => {
    const handleCloseMenu = () => setActiveDownloadMenuId(null);
    window.addEventListener("click", handleCloseMenu);
    return () => window.removeEventListener("click", handleCloseMenu);
  }, []);

  // Handle keyboard shortcut delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
        if (tag === "input" || tag === "textarea") return;
        e.preventDefault();
        onDeletePlacement(selectedId);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId, onDeletePlacement]);

  // Pointer down on a placement or move handle to begin dragging
  const handleDragStart = useCallback(
    (e: React.PointerEvent, placement: SignaturePlacement) => {
      if (e.button !== 0) return;
      e.stopPropagation();
      onSelectPlacement(placement.id);

      dragStateRef.current = {
        id: placement.id,
        startX: e.clientX,
        startY: e.clientY,
        initialXPercent: placement.xPercent,
        initialYPercent: placement.yPercent,
        widthPercent: placement.widthPercent,
        heightPercent: placement.heightPercent,
        deltaX: 0,
        deltaY: 0,
      };

      setLiveDragOffset({ id: placement.id, deltaX: 0, deltaY: 0 });
    },
    [onSelectPlacement]
  );

  // Resize start handler with aspect ratio lock
  const handleResizeStart = useCallback(
    (e: React.PointerEvent, placement: SignaturePlacement, corner: ResizeCorner = "br") => {
      if (e.button !== 0) return;
      e.stopPropagation();
      e.preventDefault();
      onSelectPlacement(placement.id);

      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const initialWidthPx = (placement.widthPercent / 100) * rect.width;
      const initialHeightPx = (placement.heightPercent / 100) * rect.height;
      const physicalAspect =
        placement.aspectRatio ?? (initialHeightPx > 0 ? initialWidthPx / initialHeightPx : 1);

      resizeStateRef.current = {
        id: placement.id,
        corner,
        startX: e.clientX,
        startY: e.clientY,
        initialXPosPx: (placement.xPercent / 100) * rect.width,
        initialYPosPx: (placement.yPercent / 100) * rect.height,
        initialWidthPx,
        initialHeightPx,
        aspectRatio: physicalAspect,
      };

      const initialResize: LiveResize = {
        id: placement.id,
        xPercent: placement.xPercent,
        yPercent: placement.yPercent,
        widthPercent: placement.widthPercent,
        heightPercent: placement.heightPercent,
      };
      liveResizeRef.current = initialResize;
      setLiveResize(initialResize);
    },
    [containerRef, onSelectPlacement]
  );

  // Global window pointer listeners for 120 FPS buttery-smooth tracking
  useEffect(() => {
    if (!liveDragOffset && !liveResize) return;

    let rafId: number | null = null;

    const onPointerMove = (e: PointerEvent) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();

      if (dragStateRef.current) {
        const ds = dragStateRef.current;
        let dx = e.clientX - ds.startX;
        let dy = e.clientY - ds.startY;

        // Clamp translation within container boundaries
        const currentXPercent = ds.initialXPercent + (dx / rect.width) * 100;
        const currentYPercent = ds.initialYPercent + (dy / rect.height) * 100;
        const maxLeft = Math.max(0, 100 - ds.widthPercent);
        const maxTop = Math.max(0, 100 - ds.heightPercent);

        const clampedXPercent = Math.max(0, Math.min(maxLeft, currentXPercent));
        const clampedYPercent = Math.max(0, Math.min(maxTop, currentYPercent));

        dx = ((clampedXPercent - ds.initialXPercent) / 100) * rect.width;
        dy = ((clampedYPercent - ds.initialYPercent) / 100) * rect.height;

        ds.deltaX = dx;
        ds.deltaY = dy;

        if (rafId !== null) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          setLiveDragOffset({ id: ds.id, deltaX: dx, deltaY: dy });
        });
      } else if (resizeStateRef.current) {
        const rs = resizeStateRef.current;
        const deltaX = e.clientX - rs.startX;

        let newWidthPx = rs.initialWidthPx;
        let newHeightPx = rs.initialHeightPx;
        let newXPosPx = rs.initialXPosPx;
        let newYPosPx = rs.initialYPosPx;

        if (rs.corner === "br") {
          const rawW = Math.max(36, rs.initialWidthPx + deltaX);
          const maxW = rect.width - rs.initialXPosPx;
          const maxH = rect.height - rs.initialYPosPx;
          const clampedW = Math.min(rawW, maxW, maxH * rs.aspectRatio);
          newWidthPx = Math.max(36, clampedW);
          newHeightPx = newWidthPx / rs.aspectRatio;
        } else if (rs.corner === "bl") {
          const rawW = Math.max(36, rs.initialWidthPx - deltaX);
          const maxW = rs.initialXPosPx + rs.initialWidthPx;
          const maxH = rect.height - rs.initialYPosPx;
          const clampedW = Math.min(rawW, maxW, maxH * rs.aspectRatio);
          newWidthPx = Math.max(36, clampedW);
          newHeightPx = newWidthPx / rs.aspectRatio;
          newXPosPx = rs.initialXPosPx + (rs.initialWidthPx - newWidthPx);
        } else if (rs.corner === "tr") {
          const rawW = Math.max(36, rs.initialWidthPx + deltaX);
          const maxW = rect.width - rs.initialXPosPx;
          const maxH = rs.initialYPosPx + rs.initialHeightPx;
          const clampedW = Math.min(rawW, maxW, maxH * rs.aspectRatio);
          newWidthPx = Math.max(36, clampedW);
          newHeightPx = newWidthPx / rs.aspectRatio;
          newYPosPx = rs.initialYPosPx + (rs.initialHeightPx - newHeightPx);
        } else if (rs.corner === "tl") {
          const rawW = Math.max(36, rs.initialWidthPx - deltaX);
          const maxW = rs.initialXPosPx + rs.initialWidthPx;
          const maxH = rs.initialYPosPx + rs.initialHeightPx;
          const clampedW = Math.min(rawW, maxW, maxH * rs.aspectRatio);
          newWidthPx = Math.max(36, clampedW);
          newHeightPx = newWidthPx / rs.aspectRatio;
          newXPosPx = rs.initialXPosPx + (rs.initialWidthPx - newWidthPx);
          newYPosPx = rs.initialYPosPx + (rs.initialHeightPx - newHeightPx);
        }

        const newWPercent = (newWidthPx / rect.width) * 100;
        const newHPercent = (newHeightPx / rect.height) * 100;
        const newXPercent = Math.max(0, Math.min(100 - newWPercent, (newXPosPx / rect.width) * 100));
        const newYPercent = Math.max(0, Math.min(100 - newHPercent, (newYPosPx / rect.height) * 100));

        const updatedResize: LiveResize = {
          id: rs.id,
          xPercent: newXPercent,
          yPercent: newYPercent,
          widthPercent: newWPercent,
          heightPercent: newHPercent,
        };

        liveResizeRef.current = updatedResize;

        if (rafId !== null) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          setLiveResize(updatedResize);
        });
      }
    };

    const onPointerUp = () => {
      if (rafId !== null) cancelAnimationFrame(rafId);

      if (dragStateRef.current) {
        const ds = dragStateRef.current;
        const container = containerRef.current;
        if (container) {
          const rect = container.getBoundingClientRect();
          const deltaXPercent = (ds.deltaX / rect.width) * 100;
          const deltaYPercent = (ds.deltaY / rect.height) * 100;
          const maxLeft = Math.max(0, 100 - ds.widthPercent);
          const maxTop = Math.max(0, 100 - ds.heightPercent);

          const finalXPercent = Math.max(0, Math.min(maxLeft, ds.initialXPercent + deltaXPercent));
          const finalYPercent = Math.max(0, Math.min(maxTop, ds.initialYPercent + deltaYPercent));

          onUpdatePlacement(ds.id, {
            xPercent: finalXPercent,
            yPercent: finalYPercent,
          });
        }
        dragStateRef.current = null;
        setLiveDragOffset(null);
      }

      if (resizeStateRef.current) {
        const rs = resizeStateRef.current;
        if (liveResizeRef.current) {
          onUpdatePlacement(rs.id, {
            xPercent: liveResizeRef.current.xPercent,
            yPercent: liveResizeRef.current.yPercent,
            widthPercent: liveResizeRef.current.widthPercent,
            heightPercent: liveResizeRef.current.heightPercent,
          });
        }
        resizeStateRef.current = null;
        liveResizeRef.current = null;
        setLiveResize(null);
      }
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, [liveDragOffset, liveResize, containerRef, onUpdatePlacement]);

  return (
    <div
      onClick={() => onSelectPlacement(null)}
      className="absolute inset-0 pointer-events-auto overflow-hidden select-none"
    >
      {activePlacements.map((placement) => {
        const isSelected = selectedId === placement.id;
        const isCurrentDragged = liveDragOffset?.id === placement.id;
        const isCurrentResized = liveResize?.id === placement.id;

        const leftPct = isCurrentResized ? liveResize.xPercent : placement.xPercent;
        const topPct = isCurrentResized ? liveResize.yPercent : placement.yPercent;
        const widthPct = isCurrentResized ? liveResize.widthPercent : placement.widthPercent;
        const heightPct = isCurrentResized ? liveResize.heightPercent : placement.heightPercent;

        const transform = isCurrentDragged
          ? `translate3d(${liveDragOffset.deltaX}px, ${liveDragOffset.deltaY}px, 0)`
          : undefined;

        // If placed near the top, float toolbar below box to avoid clipping
        const showToolbarBelow = topPct < 8;

        return (
          <div
            key={placement.id}
            onPointerDown={(e) => handleDragStart(e, placement)}
            style={{
              left: `${leftPct}%`,
              top: `${topPct}%`,
              width: `${widthPct}%`,
              height: `${heightPct}%`,
              transform,
              willChange: isCurrentDragged ? "transform" : undefined,
              zIndex: isSelected ? 20 : 10,
            }}
            className={`group absolute cursor-move select-none touch-none ${
              isSelected
                ? "border-2 border-dashed border-brand-primary bg-brand-subtle/50 rounded shadow-xs"
                : "border border-transparent hover:border-neutral-400/50 hover:bg-neutral-500/5 rounded"
            }`}
          >
            {/* Signature Graphic */}
            <div className="w-full h-full flex items-center justify-center pointer-events-none p-0.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={placement.imageDataUrl}
                alt={placement.label ?? "Signature"}
                className="w-full h-full object-contain pointer-events-none"
                draggable={false}
              />
            </div>

            {/* Continuous hover bridge so moving between signature box and toolbar never loses hover state */}
            <div
              className={`absolute left-1/2 -translate-x-1/2 w-48 h-3.5 z-20 pointer-events-auto ${
                showToolbarBelow ? "top-full" : "-top-3.5"
              }`}
            />

            {/* FLOATING ACTION TOOLBAR: Positioned cleanly above (or below) the box with continuous hit-testing */}
            <div
              className={`absolute left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white border border-neutral-200/90 shadow-md rounded-lg px-2 py-1 z-30 transition-opacity before:absolute before:inset-x-0 ${
                showToolbarBelow
                  ? "top-full mt-2 before:-top-3 before:h-3"
                  : "-top-10 before:-bottom-3 before:h-3"
              } ${
                isSelected
                  ? "opacity-100 pointer-events-auto"
                  : "opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto"
              }`}
              onPointerDown={(e) => {
                e.stopPropagation();
                onSelectPlacement(placement.id);
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag Handle Gripper */}
              <div
                onPointerDown={(e) => handleDragStart(e, placement)}
                title="Drag to move signature"
                className="flex items-center gap-1 text-[11px] font-semibold text-neutral-600 px-1 py-0.5 rounded cursor-grab active:cursor-grabbing hover:bg-neutral-100 transition-colors"
              >
                <RxDragHandleDots2 className="w-3.5 h-3.5 text-neutral-400" />
                <span>Move</span>
              </div>

              <div className="w-px h-3.5 bg-neutral-200 mx-0.5" />

              {/* Quick Download Popover Button */}
              <div className="relative">
                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDownloadMenuId((prev) => (prev === placement.id ? null : placement.id));
                  }}
                  title="Download signature PNG"
                  className={`p-1 rounded text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer ${
                    activeDownloadMenuId === placement.id ? "bg-neutral-100 text-neutral-900" : ""
                  }`}
                >
                  <HiArrowDownTray className="w-3.5 h-3.5" />
                </button>

                {/* Format Selection Popover */}
                {activeDownloadMenuId === placement.id && (
                  <div
                    className="absolute bottom-full right-0 mb-2 w-48 rounded-xl bg-white border border-neutral-200 shadow-xl p-1.5 z-40 animate-in fade-in zoom-in-95 duration-100"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-100 mb-1">
                      Download Signature
                    </div>
                    <button
                      type="button"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadSignatureImage(
                          placement.imageDataUrl,
                          "transparent",
                          placement.label ?? "signature"
                        );
                        setActiveDownloadMenuId(null);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-neutral-800 hover:bg-brand-subtle hover:text-brand-primary flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <span>Transparent PNG</span>
                      <span className="text-[10px] text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded font-medium">Clear</span>
                    </button>
                    <button
                      type="button"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadSignatureImage(
                          placement.imageDataUrl,
                          "white",
                          placement.label ?? "signature"
                        );
                        setActiveDownloadMenuId(null);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-neutral-800 hover:bg-brand-subtle hover:text-brand-primary flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <span>White BG PNG</span>
                      <span className="text-[10px] text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded font-medium">Solid</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Delete Button */}
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onDeletePlacement(placement.id);
                }}
                title="Delete signature"
                className="p-1 text-neutral-400 hover:text-brand-primary hover:bg-brand-subtle rounded transition-colors cursor-pointer"
              >
                <HiTrash className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* CORNER RESIZE HANDLES: Positioned cleanly at the 4 corners */}
            {/* 1. Top-Left */}
            <div
              onPointerDown={(e) => handleResizeStart(e, placement, "tl")}
              title="Resize signature"
              className={`absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-brand-primary rounded-full shadow-xs cursor-nwse-resize transition-opacity z-20 ${
                isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              }`}
            />

            {/* 2. Top-Right */}
            <div
              onPointerDown={(e) => handleResizeStart(e, placement, "tr")}
              title="Resize signature"
              className={`absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-brand-primary rounded-full shadow-xs cursor-nesw-resize transition-opacity z-20 ${
                isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              }`}
            />

            {/* 3. Bottom-Left */}
            <div
              onPointerDown={(e) => handleResizeStart(e, placement, "bl")}
              title="Resize signature"
              className={`absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-brand-primary rounded-full shadow-xs cursor-nesw-resize transition-opacity z-20 ${
                isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              }`}
            />

            {/* 4. Bottom-Right (Primary prominent handle) */}
            <div
              onPointerDown={(e) => handleResizeStart(e, placement, "br")}
              title="Resize signature (aspect ratio locked)"
              className={`absolute -bottom-2.5 -right-2.5 w-5 h-5 bg-brand-primary text-white rounded-full shadow-md cursor-nwse-resize transition-opacity z-20 flex items-center justify-center ${
                isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              }`}
            >
              <span className="text-[10px] font-bold leading-none select-none">⤡</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
