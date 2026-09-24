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
          aria-label="First page"
          title="First Page"
          className="min-w-[36px] min-h-[36px] p-2 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center justify-center"
        >
          <HiChevronDoubleLeft className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => onPageChange(activePage - 1)}
          disabled={activePage <= 1}
          aria-label="Previous page"
          title="Previous Page"
          className="min-w-[36px] min-h-[36px] p-2 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center justify-center"
        >
          <HiChevronLeft className="w-4 h-4" />
        </button>

        <form onSubmit={onPageInputSubmit} className="flex items-center gap-1.5 px-1">
          <span className="text-xs text-neutral-600 font-medium">Page</span>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={pageInputStr}
            onChange={(e) => onPageInputChange(e.target.value)}
            onBlur={onPageInputBlur}
            aria-label="Current page number"
            title="Type page number and press Enter"
            className="w-12 text-center rounded-lg border border-neutral-300 py-1.5 text-xs font-bold text-neutral-800 shadow-2xs focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:outline-none"
          />
          <span className="text-xs text-neutral-600 font-medium">of {pageCount}</span>
        </form>

        <button
          type="button"
          onClick={() => onPageChange(activePage + 1)}
          disabled={activePage >= pageCount}
          aria-label="Next page"
          title="Next Page"
          className="min-w-[36px] min-h-[36px] p-2 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center justify-center"
        >
          <HiChevronRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => onPageChange(pageCount)}
          disabled={activePage >= pageCount}
          aria-label="Last page"
          title="Last Page"
          className="min-w-[36px] min-h-[36px] p-2 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center justify-center"
        >
          <HiChevronDoubleRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-xs text-neutral-600 font-medium hidden sm:inline">Zoom:</span>
        <button
          type="button"
          onClick={() => onZoomChange((z) => Math.max(75, z - 15))}
          disabled={zoomLevel <= 75}
          aria-label="Zoom out"
          title="Zoom Out"
          className="min-w-[36px] min-h-[36px] p-2 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center justify-center"
        >
          <HiMagnifyingGlassMinus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onZoomChange(100)}
          aria-label="Reset zoom to 100%"
          title="Reset Zoom"
          className="min-h-[36px] px-2.5 py-1.5 text-xs font-bold rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-800 hover:bg-neutral-100 cursor-pointer flex items-center justify-center"
        >
          {zoomLevel}%
        </button>
        <button
          type="button"
          onClick={() => onZoomChange((z) => Math.min(160, z + 15))}
          disabled={zoomLevel >= 160}
          aria-label="Zoom in"
          title="Zoom In"
          className="min-w-[36px] min-h-[36px] p-2 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center justify-center"
        >
          <HiMagnifyingGlassPlus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
