"use client";

import Image from "next/image";
import { HiTrash, HiArrowDownTray } from "react-icons/hi2";
import { RxDragHandleDots2 } from "react-icons/rx";
import { downloadSignatureImage, type SignaturePlacement } from "@/lib/pdf/sign";
import type { LiveResize, ResizeCorner } from "./usePlacementTransform";

export interface PlacementBoxProps {
  placement: SignaturePlacement;
  isSelected: boolean;
  isCurrentDragged: boolean;
  isCurrentResized: boolean;
  liveDragOffset: { id: string; deltaX: number; deltaY: number } | null;
  liveResize: LiveResize | null;
  activeDownloadMenuId: string | null;
  onSelect: () => void;
  onDelete: () => void;
  onDragStart: (e: React.PointerEvent) => void;
  onResizeStart: (e: React.PointerEvent, corner: ResizeCorner) => void;
  setActiveDownloadMenuId: React.Dispatch<React.SetStateAction<string | null>>;
}

export function PlacementBox({
  placement,
  isSelected,
  isCurrentDragged,
  isCurrentResized,
  liveDragOffset,
  liveResize,
  activeDownloadMenuId,
  onSelect,
  onDelete,
  onDragStart,
  onResizeStart,
  setActiveDownloadMenuId,
}: PlacementBoxProps) {
  const leftPct = isCurrentResized ? liveResize!.xPercent : placement.xPercent;
  const topPct = isCurrentResized ? liveResize!.yPercent : placement.yPercent;
  const widthPct = isCurrentResized ? liveResize!.widthPercent : placement.widthPercent;
  const heightPct = isCurrentResized ? liveResize!.heightPercent : placement.heightPercent;

  const transform = isCurrentDragged
    ? `translate3d(${liveDragOffset!.deltaX}px, ${liveDragOffset!.deltaY}px, 0)`
    : undefined;

  const showToolbarBelow = topPct < 8;

  return (
    <div
      onPointerDown={onDragStart}
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
          ? "border-2 border-dashed border-brand-primary rounded shadow-xs"
          : "border border-transparent hover:border-neutral-400/50 rounded"
      }`}
    >
      <div className="w-full h-full flex items-center justify-center pointer-events-none p-0.5 relative">
        <Image
          src={placement.imageDataUrl}
          alt={placement.label ?? "Signature"}
          fill
          unoptimized
          className="object-contain pointer-events-none"
          draggable={false}
        />
      </div>

      <div
        className={`absolute left-1/2 -translate-x-1/2 w-48 h-3.5 z-20 pointer-events-auto ${
          showToolbarBelow ? "top-full" : "-top-3.5"
        }`}
      />

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
          onSelect();
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          onPointerDown={onDragStart}
          title="Drag to move signature"
          className="flex items-center gap-1 text-[11px] font-semibold text-neutral-600 px-1 py-0.5 rounded cursor-grab active:cursor-grabbing hover:bg-neutral-100 transition-colors"
        >
          <RxDragHandleDots2 className="w-3.5 h-3.5 text-neutral-400" />
          <span>Move</span>
        </div>

        <div className="w-px h-3.5 bg-neutral-200 mx-0.5" />

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

          {activeDownloadMenuId === placement.id && (
            <div
              className="absolute bottom-full right-0 mb-2 w-48 rounded-xl bg-white border border-neutral-200 shadow-md p-1.5 z-40 animate-in fade-in zoom-in-95 duration-100"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-2.5 py-1 text-[10px] font-semibold text-neutral-500 border-b border-neutral-100 mb-1">
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

        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          title="Delete signature"
          className="p-1 text-neutral-400 hover:text-brand-primary hover:bg-brand-subtle rounded transition-colors cursor-pointer"
        >
          <HiTrash className="w-3.5 h-3.5" />
        </button>
      </div>

      <div
        onPointerDown={(e) => onResizeStart(e, "tl")}
        title="Resize signature"
        className={`absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-brand-primary rounded-full shadow-xs cursor-nwse-resize transition-opacity z-20 ${
          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      />

      <div
        onPointerDown={(e) => onResizeStart(e, "tr")}
        title="Resize signature"
        className={`absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-brand-primary rounded-full shadow-xs cursor-nesw-resize transition-opacity z-20 ${
          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      />

      <div
        onPointerDown={(e) => onResizeStart(e, "bl")}
        title="Resize signature"
        className={`absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-brand-primary rounded-full shadow-xs cursor-nesw-resize transition-opacity z-20 ${
          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      />

      <div
        onPointerDown={(e) => onResizeStart(e, "br")}
        title="Resize signature (aspect ratio locked)"
        className={`absolute -bottom-2.5 -right-2.5 w-5 h-5 bg-brand-primary text-white rounded-full shadow-md cursor-nwse-resize transition-opacity z-20 flex items-center justify-center ${
          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        <span className="text-[10px] font-bold leading-none select-none">⤡</span>
      </div>
    </div>
  );
}
