"use client";

import {
  GripDotsIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  TrashIcon,
} from "@/components/common/icons";

export interface PdfFileItemData {
  id: string;
  name: string;
  previewTitle: string;
  size: string;
  pages: number;
  thumbnailUrl?: string;
  data?: ArrayBuffer;
}

interface FileItemProps {
  file: PdfFileItemData;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDelete?: () => void;
  dragHandleRef?: (element: Element | null) => void;
}

export function FileItem({
  file,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onDelete,
  dragHandleRef,
}: FileItemProps) {
  return (
    <div className="w-full border border-neutral-200 rounded-xl bg-white px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between mb-3 shadow-2xs hover:border-neutral-300 transition-colors">
      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
        <button
          ref={dragHandleRef}
          type="button"
          aria-label="Drag file to reorder"
          className="text-neutral-400 hover:text-neutral-600 cursor-grab shrink-0 p-1 -m-1"
        >
          <GripDotsIcon className="w-4 h-4" />
        </button>

        <div className="w-11 h-13 sm:w-13 sm:h-15 rounded-md border border-neutral-200 bg-neutral-50/60 p-1 flex flex-col justify-between shrink-0 shadow-2xs select-none overflow-hidden relative">
          {file.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={file.thumbnailUrl}
              alt={file.previewTitle}
              className="w-full h-full object-contain rounded-xs"
            />
          ) : (
            <>
              <span className="text-[8px] font-bold text-neutral-900 leading-[10px] line-clamp-2">
                {file.previewTitle}
              </span>
              <div className="w-full space-y-1 mt-1">
                <div className="h-0.5 bg-neutral-200 rounded-full w-full" />
                <div className="h-0.5 bg-neutral-200 rounded-full w-4/5" />
                <div className="h-0.5 bg-neutral-200 rounded-full w-3/5" />
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col min-w-0">
          <span className="text-xs sm:text-sm font-semibold text-neutral-900 truncate">
            {file.name}
          </span>
          <span className="text-[11px] sm:text-xs text-neutral-400 mt-0.5 truncate">
            {file.size}, {file.pages} pages
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-2 sm:ml-4">
        <button
          type="button"
          aria-label="Move file up"
          disabled={isFirst}
          onClick={onMoveUp}
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-colors ${
            isFirst
              ? "bg-neutral-100/60 text-neutral-300 cursor-not-allowed"
              : "bg-neutral-100 hover:bg-neutral-200 text-neutral-600 cursor-pointer"
          }`}
        >
          <ArrowUpIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        <button
          type="button"
          aria-label="Move file down"
          disabled={isLast}
          onClick={onMoveDown}
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-colors ${
            isLast
              ? "bg-neutral-100/60 text-neutral-300 cursor-not-allowed"
              : "bg-neutral-100 hover:bg-neutral-200 text-neutral-600 cursor-pointer"
          }`}
        >
          <ArrowDownIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        <button
          type="button"
          aria-label="Remove file"
          onClick={onDelete}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center bg-white hover:bg-neutral-50 text-neutral-400 hover:text-brand-primary border border-neutral-200 cursor-pointer transition-colors"
        >
          <TrashIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>
    </div>
  );
}
