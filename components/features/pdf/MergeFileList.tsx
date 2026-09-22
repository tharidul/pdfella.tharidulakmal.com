"use client";

import { DragDropProvider } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { arrayMove } from "@dnd-kit/helpers";
import { TrashIcon } from "@/components/common/icons";
import { FileItem, type PdfFileItemData } from "./FileItem";

interface SortableFileItemProps {
  file: PdfFileItemData;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}

function SortableFileItem({
  file,
  index,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onDelete,
}: SortableFileItemProps) {
  const { ref, handleRef, isDragging } = useSortable({
    id: file.id,
    index,
  });

  return (
    <div
      ref={ref}
      style={{
        opacity: isDragging ? 0.4 : 1,
        transition: "opacity 150ms ease",
      }}
    >
      <FileItem
        file={file}
        isFirst={isFirst}
        isLast={isLast}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onDelete={onDelete}
        dragHandleRef={handleRef}
      />
    </div>
  );
}

export interface MergeFileListProps {
  files: PdfFileItemData[];
  setFiles: React.Dispatch<React.SetStateAction<PdfFileItemData[]>>;
  onClearAll: () => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onDelete: (id: string) => void;
  onMerge?: () => void;
  isMerging?: boolean;
}

export function MergeFileList({
  files,
  setFiles,
  onClearAll,
  onMoveUp,
  onMoveDown,
  onDelete,
}: MergeFileListProps) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-sm font-bold text-neutral-900">
          {files.length} {files.length === 1 ? "file" : "files"}
        </span>
        <button
          type="button"
          onClick={onClearAll}
          className="text-xs font-semibold text-brand-primary hover:text-brand-primary-hover flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <TrashIcon className="w-4 h-4" />
          <span>Clear all</span>
        </button>
      </div>

      <DragDropProvider
        onDragEnd={(event) => {
          const { source, target } = event.operation;
          if (source && target && source.id !== target.id) {
            const fromIndex = files.findIndex((f) => f.id === source.id);
            const toIndex = files.findIndex((f) => f.id === target.id);
            if (fromIndex !== -1 && toIndex !== -1) {
              setFiles((prev) => arrayMove(prev, fromIndex, toIndex));
            }
          }
        }}
      >
        <div className="flex flex-col">
          {files.map((file, index) => (
            <SortableFileItem
              key={file.id}
              file={file}
              index={index}
              isFirst={index === 0}
              isLast={index === files.length - 1}
              onMoveUp={() => onMoveUp(index)}
              onMoveDown={() => onMoveDown(index)}
              onDelete={() => onDelete(file.id)}
            />
          ))}
        </div>
      </DragDropProvider>
    </div>
  );
}
