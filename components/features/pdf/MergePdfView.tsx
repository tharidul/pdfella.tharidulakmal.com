"use client";

import { useState, useCallback } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { arrayMove } from "@dnd-kit/helpers";
import { TrashIcon } from "@/components/common/icons";
import { DropZone } from "./DropZone";
import { FileItem, type PdfFileItemData } from "./FileItem";
import { MergeActionBar } from "./MergeActionBar";
import {
  validatePdfFile,
  extractPdfMetadata,
  renderPageThumbnail,
  mergeAndDownloadPdfs,
  type MergeInputItem,
} from "@/lib/pdf";

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

export function MergePdfView() {
  const [files, setFiles] = useState<PdfFileItemData[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMerging, setIsMerging] = useState(false);

  const handleMoveUp = useCallback((index: number) => {
    if (index === 0) return;
    setFiles((prev) => arrayMove(prev, index, index - 1));
  }, []);

  const handleMoveDown = useCallback((index: number) => {
    setFiles((prev) => {
      if (index >= prev.length - 1) return prev;
      return arrayMove(prev, index, index + 1);
    });
  }, []);

  const handleDelete = useCallback((id: string) => {
    setFiles((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleClearAll = useCallback(() => {
    setFiles([]);
    setErrorMessage(null);
  }, []);

  const handleFilesSelected = async (selectedFiles: FileList) => {
    setErrorMessage(null);
    const fileArray = Array.from(selectedFiles);

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      if (!file) continue;

      // 1. Validate file
      const validation = await validatePdfFile(file);
      if (!validation.isValid) {
        setErrorMessage(validation.error);
        continue;
      }

      try {
        const buffer = await file.arrayBuffer();

        // 2. Extract metadata
        const metadata = await extractPdfMetadata(buffer, file.name);

        const newItemId = `pdf-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`;
        const newItem: PdfFileItemData = {
          id: newItemId,
          name: file.name,
          previewTitle: metadata.title || file.name.replace(/\.pdf$/i, "").replace(/[-_]/g, " "),
          size: metadata.formattedSize,
          pages: metadata.pageCount,
          data: buffer,
        };

        setFiles((prev) => [...prev, newItem]);

        // 3. Asynchronously generate thumbnail for first page
        renderPageThumbnail(buffer, 1, { width: 104, height: 120 })
          .then((thumbnailUrl) => {
            setFiles((prev) =>
              prev.map((item) =>
                item.id === newItemId ? { ...item, thumbnailUrl } : item
              )
            );
          })
          .catch(() => {
            // Fallback placeholder is displayed automatically
          });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to load PDF.";
        setErrorMessage(`Could not load "${file.name}": ${msg}`);
      }
    }
  };

  const handleMerge = async () => {
    if (files.length < 2 || isMerging) return;

    setIsMerging(true);
    setErrorMessage(null);

    try {
      const mergeItems: MergeInputItem[] = files.map((f) => {
        if (!f.data) {
          throw new Error(`Data missing for document: ${f.name}`);
        }
        return {
          id: f.id,
          name: f.name,
          data: f.data,
        };
      });

      await mergeAndDownloadPdfs(mergeItems);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Merge operation failed.";
      setErrorMessage(msg);
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <main className="w-full max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-8 flex flex-col">
      <div className="flex flex-col mb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-[#800020] mb-1.5">
          MERGE PDFS
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight mb-1.5">
          Combine multiple PDFs into one
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500">
          Add PDF files, arrange them in the desired order, and merge them into a
          single document.
        </p>
      </div>

      <DropZone onFilesSelected={handleFilesSelected} />

      {errorMessage && (
        <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-[#800020] flex items-center justify-between">
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-neutral-400 hover:text-neutral-700 font-bold ml-3 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {files.length > 0 && (
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-sm font-bold text-neutral-900">
              {files.length} {files.length === 1 ? "file" : "files"}
            </span>
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs font-semibold text-[#800020] hover:text-[#66001a] flex items-center gap-1.5 transition-colors cursor-pointer"
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
                  onMoveUp={() => handleMoveUp(index)}
                  onMoveDown={() => handleMoveDown(index)}
                  onDelete={() => handleDelete(file.id)}
                />
              ))}
            </div>
          </DragDropProvider>

          <MergeActionBar
            fileCount={files.length}
            onMerge={handleMerge}
            isMerging={isMerging}
          />
        </div>
      )}
    </main>
  );
}
