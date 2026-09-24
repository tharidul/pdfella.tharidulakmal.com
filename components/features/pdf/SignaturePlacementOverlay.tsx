"use client";

import { useState, useEffect } from "react";
import type { SignaturePlacement } from "@/lib/pdf/sign";
import { usePlacementTransform } from "./signature/usePlacementTransform";
import { PlacementBox } from "./signature/PlacementBox";

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

export function SignaturePlacementOverlay({
  containerRef,
  placements,
  activePageNumber,
  selectedId,
  onSelectPlacement,
  onUpdatePlacement,
  onDeletePlacement,
}: SignaturePlacementOverlayProps) {
  const [activeDownloadMenuId, setActiveDownloadMenuId] = useState<string | null>(null);

  const {
    liveDragOffset,
    liveResize,
    handleDragStart,
    handleResizeStart,
  } = usePlacementTransform(containerRef, onSelectPlacement, onUpdatePlacement);

  const activePlacements = placements.filter((p) => p.pageNumber === activePageNumber);

  useEffect(() => {
    const handleCloseMenu = () => setActiveDownloadMenuId(null);
    window.addEventListener("click", handleCloseMenu);
    return () => window.removeEventListener("click", handleCloseMenu);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea") return;

      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        e.preventDefault();
        onDeletePlacement(selectedId);
        return;
      }

      if (
        selectedId &&
        (e.key === "ArrowLeft" ||
          e.key === "ArrowRight" ||
          e.key === "ArrowUp" ||
          e.key === "ArrowDown")
      ) {
        const current = placements.find((p) => p.id === selectedId);
        if (!current) return;
        e.preventDefault();
        const step = e.shiftKey ? 2 : 0.5;
        let deltaX = 0;
        let deltaY = 0;
        if (e.key === "ArrowLeft") deltaX = -step;
        if (e.key === "ArrowRight") deltaX = step;
        if (e.key === "ArrowUp") deltaY = -step;
        if (e.key === "ArrowDown") deltaY = step;

        const newX = Math.max(0, Math.min(100 - current.widthPercent, current.xPercent + deltaX));
        const newY = Math.max(0, Math.min(100 - current.heightPercent, current.yPercent + deltaY));
        onUpdatePlacement(selectedId, { xPercent: newX, yPercent: newY });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId, onDeletePlacement, onUpdatePlacement, placements]);

  return (
    <div
      onClick={() => onSelectPlacement(null)}
      className="absolute inset-0 pointer-events-auto overflow-hidden select-none"
    >
      {activePlacements.map((placement) => (
        <PlacementBox
          key={placement.id}
          placement={placement}
          isSelected={selectedId === placement.id}
          isCurrentDragged={liveDragOffset?.id === placement.id}
          isCurrentResized={liveResize?.id === placement.id}
          liveDragOffset={liveDragOffset}
          liveResize={liveResize}
          activeDownloadMenuId={activeDownloadMenuId}
          onSelect={() => onSelectPlacement(placement.id)}
          onDelete={() => onDeletePlacement(placement.id)}
          onDragStart={(e) => handleDragStart(e, placement)}
          onResizeStart={(e, corner) => handleResizeStart(e, placement, corner)}
          setActiveDownloadMenuId={setActiveDownloadMenuId}
        />
      ))}
    </div>
  );
}
