"use client";

import { HiDocumentText } from "react-icons/hi2";
import { formatFileSize } from "@/lib/pdf/validation";

interface PdfFileHeaderProps {
  fileName: string;
  fileSize: number | string;
  pageCount?: number;
  extraInfo?: React.ReactNode;
  onReset: () => void;
  resetLabel?: string;
}

export function PdfFileHeader({
  fileName,
  fileSize,
  pageCount,
  extraInfo,
  onReset,
  resetLabel = "Choose different file",
}: PdfFileHeaderProps) {
  const sizeDisplay = typeof fileSize === "number" ? formatFileSize(fileSize) : fileSize;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-neutral-50/80 px-5 py-3.5 shadow-2xs">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-brand-subtle text-brand-primary flex items-center justify-center shrink-0">
          <HiDocumentText className="w-5 h-5" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-bold text-neutral-900 truncate max-w-xs sm:max-w-md">
            {fileName}
          </span>
          <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
            <span>{sizeDisplay}</span>
            {pageCount !== undefined && (
              <>
                <span>•</span>
                <span>{pageCount} {pageCount === 1 ? "page" : "pages"}</span>
              </>
            )}
            {extraInfo}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="text-xs font-semibold text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
      >
        {resetLabel}
      </button>
    </div>
  );
}
