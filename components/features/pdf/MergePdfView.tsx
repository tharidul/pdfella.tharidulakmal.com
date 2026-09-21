"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { DropZone } from "./DropZone";
import type { PdfFileItemData } from "./FileItem";
import { validatePdfFile } from "@/lib/pdf/validation";
import { extractPdfMetadata } from "@/lib/pdf/metadata";
import { renderPageThumbnail } from "@/lib/pdf/render";
import { mergeAndDownloadPdfs, type MergeInputItem } from "@/lib/pdf/merge";

const MergeFileList = dynamic(
  () => import("./MergeFileList").then((mod) => mod.MergeFileList),
  {
    loading: () => (
      <div className="py-6 text-center text-xs text-neutral-500">
        Loading document list...
      </div>
    ),
    ssr: false,
  }
);

export function MergePdfView() {
  const [files, setFiles] = useState<PdfFileItemData[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMerging, setIsMerging] = useState(false);

  const handleMoveUp = useCallback((index: number) => {
    if (index === 0) return;
    setFiles((prev) => {
      const copy = [...prev];
      const item = copy.splice(index, 1)[0];
      if (item !== undefined) copy.splice(index - 1, 0, item);
      return copy;
    });
  }, []);

  const handleMoveDown = useCallback((index: number) => {
    setFiles((prev) => {
      if (index >= prev.length - 1) return prev;
      const copy = [...prev];
      const item = copy.splice(index, 1)[0];
      if (item !== undefined) copy.splice(index + 1, 0, item);
      return copy;
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
        <MergeFileList
          files={files}
          setFiles={setFiles}
          onClearAll={handleClearAll}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
          onDelete={handleDelete}
          onMerge={handleMerge}
          isMerging={isMerging}
        />
      )}
    </main>
  );
}
