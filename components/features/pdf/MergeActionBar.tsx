"use client";

import { InfoIcon, ArrowRightIcon } from "@/components/common/icons";

interface MergeActionBarProps {
  fileCount: number;
  onMerge?: () => void;
  isMerging?: boolean;
}

export function MergeActionBar({ fileCount, onMerge, isMerging = false }: MergeActionBarProps) {
  const canMerge = fileCount >= 2 && !isMerging;

  return (
    <div className="w-full rounded-2xl p-4 bg-[#fdf2f4] border border-[#f8cfd5] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mt-5 shadow-2xs">
      <div className="flex items-center gap-3.5">
        <div className="w-7 h-7 rounded-full bg-[#800020] text-white flex items-center justify-center shrink-0 shadow-2xs">
          <InfoIcon className="w-4 h-4" />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-sm font-bold text-[#800020] leading-tight">
            {isMerging ? "Merging documents..." : fileCount < 2 ? "Add more files" : "Ready to merge"}
          </span>
          <span className="text-xs text-neutral-600 leading-tight mt-0.5">
            {fileCount < 2
              ? "At least 2 PDF documents are required to merge."
              : `${fileCount} PDF documents will be combined in the order shown above.`}
          </span>
        </div>
      </div>

      <button
        type="button"
        disabled={!canMerge}
        onClick={onMerge}
        className={`w-full sm:w-auto justify-center px-7 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 shadow-xs transition-colors duration-150 ${
          canMerge
            ? "bg-[#800020] hover:bg-[#66001a] text-white cursor-pointer"
            : "bg-neutral-300 text-neutral-500 cursor-not-allowed"
        }`}
      >
        <span>{isMerging ? "Merging..." : "Merge PDFs"}</span>
        <ArrowRightIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
