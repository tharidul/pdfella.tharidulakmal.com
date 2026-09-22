"use client";

import Image from "next/image";
import type { Dispatch, SetStateAction } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { arrayMove } from "@dnd-kit/helpers";
import { HiTrash, HiArrowLeft, HiArrowRight } from "react-icons/hi2";
import { LuRotateCw, LuRotateCcw } from "react-icons/lu";
import type { OrganizePageOrder } from "@/lib/pdf/organize";

export interface OrganizeCardItem extends OrganizePageOrder {
  thumbnailUrl?: string;
}

interface SortablePageCardProps {
  page: OrganizeCardItem;
  index: number;
  totalCount: number;
  onMovePage: (index: number, direction: -1 | 1) => void;
  onRotatePage: (id: string, delta: number) => void;
  onDeletePage: (id: string) => void;
}

function SortablePageCard({
  page,
  index,
  totalCount,
  onMovePage,
  onRotatePage,
  onDeletePage,
}: SortablePageCardProps) {
  const { ref, isDragging } = useSortable({
    id: page.id,
    index,
  });

  return (
    <div
      ref={ref}
      style={{
        opacity: isDragging ? 0.4 : 1,
        transition: "opacity 150ms ease",
      }}
      className="border border-neutral-200 rounded-xl bg-white p-3 flex flex-col items-center justify-between shadow-xs hover:border-neutral-300 transition-colors duration-150 group"
    >
      <div className="w-full flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-100 text-neutral-700">
          #{index + 1} (Orig: {page.originalNumber})
        </span>
        <button
          type="button"
          aria-label="Delete page"
          disabled={totalCount <= 1}
          onClick={() => onDeletePage(page.id)}
          className={`p-1 transition-colors ${
            totalCount <= 1
              ? "text-neutral-200 cursor-not-allowed"
              : "text-neutral-400 hover:text-brand-primary cursor-pointer"
          }`}
        >
          <HiTrash className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="w-full h-36 bg-neutral-50/60 border border-neutral-200/60 rounded-md p-2 flex flex-col justify-between overflow-hidden relative">
        <div
          style={{ transform: `rotate(${page.rotation}deg)` }}
          className="w-full h-full flex flex-col justify-between transition-transform duration-200"
        >
          {page.thumbnailUrl ? (
            <Image
              src={page.thumbnailUrl}
              alt={`Page ${page.originalNumber}`}
              fill
              unoptimized
              className="object-contain"
            />
          ) : (
            <>
              <div className="space-y-1 mt-1">
                <div className="h-1 bg-neutral-200 rounded-full w-full" />
                <div className="h-1 bg-neutral-200 rounded-full w-4/5" />
                <div className="h-1 bg-neutral-200 rounded-full w-2/3" />
              </div>
              <span className="text-[9px] text-center text-neutral-400 font-medium">
                Page {page.originalNumber}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="w-full flex items-center justify-between mt-3 pt-2 border-t border-neutral-100">
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Move previous"
            disabled={index === 0}
            onClick={() => onMovePage(index, -1)}
            className={`p-1 rounded ${
              index === 0
                ? "text-neutral-300 cursor-not-allowed"
                : "text-neutral-600 hover:bg-neutral-100 cursor-pointer"
            }`}
          >
            <HiArrowLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            aria-label="Move next"
            disabled={index === totalCount - 1}
            onClick={() => onMovePage(index, 1)}
            className={`p-1 rounded ${
              index === totalCount - 1
                ? "text-neutral-300 cursor-not-allowed"
                : "text-neutral-600 hover:bg-neutral-100 cursor-pointer"
            }`}
          >
            <HiArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Rotate counter-clockwise"
            onClick={() => onRotatePage(page.id, -90)}
            className="p-1.5 rounded-md hover:bg-neutral-100 text-neutral-600 transition-colors cursor-pointer"
          >
            <LuRotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            aria-label="Rotate clockwise"
            onClick={() => onRotatePage(page.id, 90)}
            className="p-1.5 rounded-md hover:bg-neutral-100 text-neutral-600 transition-colors cursor-pointer"
          >
            <LuRotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export interface OrganizePageGridProps {
  pages: OrganizeCardItem[];
  setPages: Dispatch<SetStateAction<OrganizeCardItem[]>>;
  onMovePage: (index: number, direction: -1 | 1) => void;
  onRotatePage: (id: string, delta: number) => void;
  onDeletePage: (id: string) => void;
}

export function OrganizePageGrid({
  pages,
  setPages,
  onMovePage,
  onRotatePage,
  onDeletePage,
}: OrganizePageGridProps) {
  return (
    <DragDropProvider
      onDragEnd={(event) => {
        const { source, target } = event.operation;
        if (source && target && source.id !== target.id) {
          const fromIndex = pages.findIndex((p) => p.id === source.id);
          const toIndex = pages.findIndex((p) => p.id === target.id);
          if (fromIndex !== -1 && toIndex !== -1) {
            setPages((prev) => arrayMove(prev, fromIndex, toIndex));
          }
        }
      }}
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {pages.map((page, index) => (
          <SortablePageCard
            key={page.id}
            page={page}
            index={index}
            totalCount={pages.length}
            onMovePage={onMovePage}
            onRotatePage={onRotatePage}
            onDeletePage={onDeletePage}
          />
        ))}
      </div>
    </DragDropProvider>
  );
}
