"use client";

import {
  HiChevronLeft,
  HiChevronRight,
  HiChevronDoubleLeft,
  HiChevronDoubleRight,
  HiMagnifyingGlassPlus,
  HiMagnifyingGlassMinus,
} from "react-icons/hi2";

export interface PdfViewerToolbarProps {
  activePage: number;
  pageCount: number;
  pageInputStr: string;
  zoomLevel: number;
  onPageChange: (newPage: number) => void;
  onPageInputSubmit: (e: React.FormEvent) => void;
  onPageInputChange: (val: string) => void;
  onPageInputBlur: () => void;
  onZoomChange: (newZoom: number | ((z: number) => number)) => void;
}

export function PdfViewerToolbar({
  activePage,
  pageCount,
  pageInputStr,
  zoomLevel,
  onPageChange,
  onPageInputSubmit,
  onPageInputChange,
  onPageInputBlur,
  onZoomChange,
}: PdfViewerToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between w-full rounded-xl border border-neutral-200 bg-white p-2.5 shadow-2xs mb-3 gap-3">
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={activePage <= 1}
          title="First Page"
          className="p-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <HiChevronDoubleLeft className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => onPageChange(activePage - 1)}
          disabled={activePage <= 1}
          title="Previous Page"
          className="p-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <HiChevronLeft className="w-3.5 h-3.5" />
        </button>

        <form onSubmit={onPageInputSubmit} className="flex items-center gap-1.5 px-1">
          <span className="text-xs text-neutral-500 font-medium">Page</span>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={pageInputStr}
            onChange={(e) => onPageInputChange(e.target.value)}
            onBlur={onPageInputBlur}
            title="Type page number and press Enter"
            className="w-12 text-center rounded-lg border border-neutral-300 py-1 text-xs font-bold text-neutral-800 shadow-2xs focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:outline-none"
          />
          <span className="text-xs text-neutral-500 font-medium">of {pageCount}</span>
        </form>

        <button
          type="button"
          onClick={() => onPageChange(activePage + 1)}
          disabled={activePage >= pageCount}
          title="Next Page"
          className="p-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <HiChevronRight className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => onPageChange(pageCount)}
          disabled={activePage >= pageCount}
          title="Last Page"
          className="p-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <HiChevronDoubleRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-[11px] text-neutral-500 font-medium hidden sm:inline">Zoom:</span>
        <button
          type="button"
          onClick={() => onZoomChange((z) => Math.max(75, z - 15))}
          disabled={zoomLevel <= 75}
          title="Zoom Out"
          className="p-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <HiMagnifyingGlassMinus className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onZoomChange(100)}
          title="Reset Zoom"
          className="px-2 py-1 text-[11px] font-bold rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100 cursor-pointer"
        >
          {zoomLevel}%
        </button>
        <button
          type="button"
          onClick={() => onZoomChange((z) => Math.min(160, z + 15))}
          disabled={zoomLevel >= 160}
          title="Zoom In"
          className="p-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <HiMagnifyingGlassPlus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
