"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { SignaturePlacement } from "@/lib/pdf/sign";

export type ResizeCorner = "tl" | "tr" | "bl" | "br";

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

export interface LiveResize {
  id: string;
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  heightPercent: number;
}

export function usePlacementTransform(
  containerRef: React.RefObject<HTMLDivElement | null>,
  onSelectPlacement: (id: string | null) => void,
  onUpdatePlacement: (
    id: string,
    updates: Partial<Pick<SignaturePlacement, "xPercent" | "yPercent" | "widthPercent" | "heightPercent">>
  ) => void
) {
  const [liveDragOffset, setLiveDragOffset] = useState<{ id: string; deltaX: number; deltaY: number } | null>(null);
  const dragStateRef = useRef<DragTracking | null>(null);

  const [liveResize, setLiveResize] = useState<LiveResize | null>(null);
  const liveResizeRef = useRef<LiveResize | null>(null);
  const resizeStateRef = useRef<ResizeTracking | null>(null);

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
          newXPosPx = rs.initialXPosPx;
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
      if (dragStateRef.current) {
        const ds = dragStateRef.current;
        const container = containerRef.current;
        if (container) {
          const rect = container.getBoundingClientRect();
          const finalX = ds.initialXPercent + (ds.deltaX / rect.width) * 100;
          const finalY = ds.initialYPercent + (ds.deltaY / rect.height) * 100;
          const maxLeft = Math.max(0, 100 - ds.widthPercent);
          const maxTop = Math.max(0, 100 - ds.heightPercent);

          onUpdatePlacement(ds.id, {
            xPercent: Math.max(0, Math.min(maxLeft, finalX)),
            yPercent: Math.max(0, Math.min(maxTop, finalY)),
          });
        }
        dragStateRef.current = null;
        setLiveDragOffset(null);
      }

      if (resizeStateRef.current) {
        const current = liveResizeRef.current;
        if (current) {
          onUpdatePlacement(current.id, {
            xPercent: current.xPercent,
            yPercent: current.yPercent,
            widthPercent: current.widthPercent,
            heightPercent: current.heightPercent,
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

  return {
    liveDragOffset,
    liveResize,
    handleDragStart,
    handleResizeStart,
  };
}
