"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { HiArrowRight, HiArrowPath } from "react-icons/hi2";
import { toast } from "@/components/ui/sonner";
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
  }, []);

  const handleFilesSelected = async (selectedFiles: FileList) => {
    const fileArray = Array.from(selectedFiles);

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      if (!file) continue;

      const validation = await validatePdfFile(file);
      if (!validation.isValid) {
        toast.error(validation.error);
        continue;
      }

      try {
        const buffer = await file.arrayBuffer();

        const metadata = await extractPdfMetadata(buffer, file.name);

        const newItemId = crypto.randomUUID();
        const newItem: PdfFileItemData = {
          id: newItemId,
          name: file.name,
          previewTitle: metadata.title || file.name.replace(/\.pdf$/i, "").replace(/[-_]/g, " "),
          size: metadata.formattedSize,
          pages: metadata.pageCount,
          data: buffer,
        };

        setFiles((prev) => [...prev, newItem]);

        renderPageThumbnail(buffer, 1, { width: 104, height: 120 })
          .then((thumbnailUrl) => {
            setFiles((prev) =>
              prev.map((item) =>
                item.id === newItemId ? { ...item, thumbnailUrl } : item
              )
            );
          })
          .catch((e: unknown) => {
            console.warn("Thumbnail render failed", e);
          });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to load PDF.";
        toast.error(`Could not load "${file.name}": ${msg}`);
      }
    }
  };

  const handleMerge = async () => {
    if (files.length < 2 || isMerging) return;

    setIsMerging(true);

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
      toast.success("PDF documents merged and downloaded successfully!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Merge operation failed.";
      toast.error(msg);
    } finally {
      setIsMerging(false);
    }
  };

  const totalPages = files.reduce((sum, f) => sum + (f.pages || 0), 0);
  const canMerge = files.length >= 2 && !isMerging;

  return (
    <main
      className={
        files.length > 0
          ? "w-full max-w-6xl mx-auto px-4 py-6 flex flex-col"
          : "w-full max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-8 flex flex-col"
      }
    >
      <div className="flex flex-col mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight mb-1.5">
          Combine multiple PDFs into one
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500">
          Add PDF files, arrange them in the desired order, and merge them into a
          single document.
        </p>
      </div>

      {files.length === 0 ? (
        <DropZone onFilesSelected={handleFilesSelected} />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 flex flex-col space-y-5">
              <div className="border border-neutral-200 rounded-2xl bg-white p-4 sm:p-5 shadow-2xs">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-100">
                  <span className="text-xs font-semibold text-neutral-800">
                    Document order ({files.length})
                  </span>
                  <span className="text-xs text-neutral-500">
                    Drag handles or arrows to rearrange
                  </span>
                </div>

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
              </div>

              <div className="border border-neutral-200 rounded-2xl bg-white p-4 shadow-2xs">
                <span className="text-xs font-bold text-neutral-700 block mb-2">
                  Add more documents
                </span>
                <DropZone onFilesSelected={handleFilesSelected} />
              </div>
            </div>

            <div className="lg:col-span-4 lg:sticky lg:top-6 self-start">
              <div className="rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-xs flex flex-col gap-5">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-700">
                      Merge summary
                    </span>
                    <button
                      type="button"
                      onClick={handleClearAll}
                      className="text-xs font-semibold text-brand-primary hover:text-brand-primary-hover transition-colors cursor-pointer"
                    >
                      Clear all
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-500">Documents:</span>
                    <span className="font-bold text-brand-primary">{files.length}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-500">Total pages:</span>
                    <span className="font-semibold text-neutral-800">
                      {totalPages > 0 ? `${totalPages} pages` : "Calculating..."}
                    </span>
                  </div>
                </div>

                <hr className="border-neutral-100" />

                <div className="space-y-2.5">
                  <button
                    type="button"
                    disabled={!canMerge}
                    onClick={handleMerge}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-primary py-3.5 px-4 text-sm font-bold text-white shadow-sm hover:bg-brand-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 cursor-pointer"
                  >
                    {isMerging ? (
                      <>
                        <HiArrowPath className="w-4 h-4 animate-spin" />
                        <span>Merging Documents...</span>
                      </>
                    ) : (
                      <>
                        <span>Merge PDFs</span>
                        <HiArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-neutral-400 text-center leading-relaxed">
                    {files.length < 2
                      ? "Add at least 2 PDF documents to merge."
                      : "All merging executes locally in your browser."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
