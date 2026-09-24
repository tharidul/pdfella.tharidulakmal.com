"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  HiDocumentText,
  HiArrowRight,
  HiArrowPath,
} from "react-icons/hi2";
import { toast } from "@/components/ui/sonner";
import { LuRotateCw, LuRotateCcw } from "react-icons/lu";
import { DropZone } from "./DropZone";
import { validatePdfFile } from "@/lib/pdf/validation";
import { extractPdfMetadata } from "@/lib/pdf/metadata";
import { renderDocumentThumbnailsBatch, releasePdfDocument } from "@/lib/pdf/render";
import { organizeAndDownloadPdf } from "@/lib/pdf/organize";
import type { OrganizeCardItem } from "./OrganizePageGrid";

const OrganizePageGrid = dynamic(
  () => import("./OrganizePageGrid").then((mod) => mod.OrganizePageGrid),
  {
    loading: () => (
      <div className="py-12 text-center text-xs text-neutral-500">
        Loading document pages...
      </div>
    ),
    ssr: false,
  }
);

export function OrganizePdfView() {
  const [hasFile, setHasFile] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [pages, setPages] = useState<OrganizeCardItem[]>([]);
  const [isOrganizing, setIsOrganizing] = useState(false);

  const rotatePage = useCallback((id: string, delta: number) => {
    setPages((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, rotation: (p.rotation + delta + 360) % 360 } : p
      )
    );
  }, []);

  const movePage = useCallback((index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    setPages((prev) => {
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      if (item !== undefined) copy.splice(targetIndex, 0, item);
      return copy;
    });
  }, []);

  const deletePage = useCallback((id: string) => {
    setPages((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((p) => p.id !== id);
    });
  }, []);

  const rotateAll = useCallback((delta: number) => {
    setPages((prev) =>
      prev.map((p) => ({ ...p, rotation: (p.rotation + delta + 360) % 360 }))
    );
  }, []);

  const resetAll = useCallback(() => {
    if (!fileBuffer) return;
    setPages((prev) =>
      [...prev]
        .sort((a, b) => a.originalNumber - b.originalNumber)
        .map((p) => ({ ...p, rotation: 0 }))
    );
  }, [fileBuffer]);

  const handleFilesSelected = async (files: FileList) => {
    const file = files[0];
    if (!file) return;

    const validation = await validatePdfFile(file);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    try {
      const buffer = await file.arrayBuffer();
      const metadata = await extractPdfMetadata(buffer, file.name);

      const initialPages: OrganizeCardItem[] = Array.from(
        { length: metadata.pageCount },
        (_, i) => ({
          id: `org-page-${Date.now()}-${i + 1}`,
          originalNumber: i + 1,
          rotation: 0,
        })
      );

      setFileName(file.name);
      setFileSize(metadata.formattedSize);
      setFileBuffer(buffer);
      setPages(initialPages);
      setHasFile(true);

      const pageNumbers = Array.from({ length: metadata.pageCount }, (_, i) => i + 1);
      void renderDocumentThumbnailsBatch(
        buffer,
        pageNumbers,
        { width: 140, height: 180 },
        (batch) => {
          setPages((currentPages) =>
            currentPages.map((item) =>
              batch[item.originalNumber]
                ? { ...item, thumbnailUrl: batch[item.originalNumber] }
                : item
            )
          );
        },
        12
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load PDF.";
      toast.error(msg);
    }
  };

  const handleSaveOrganized = async () => {
    if (!fileBuffer || pages.length === 0 || isOrganizing) return;

    setIsOrganizing(true);

    try {
      await organizeAndDownloadPdf({
        data: fileBuffer,
        name: fileName,
        pages,
      });
      toast.success("PDF pages organized and saved successfully!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Organize operation failed.";
      toast.error(msg);
    } finally {
      setIsOrganizing(false);
    }
  };

  return (
    <main
      className={
        hasFile
          ? "w-full max-w-6xl mx-auto px-4 py-6 flex flex-col"
          : "w-full max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-8 flex flex-col"
      }
    >
      <div className="flex flex-col mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight mb-1.5">
          Reorder, rotate & manage PDF pages
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500">
          Reorder pages, rotate individual sheets, and delete unwanted pages
          before creating the final document.
        </p>
      </div>

      {!hasFile ? (
        <DropZone onFilesSelected={handleFilesSelected} />
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-neutral-50/80 px-5 py-3.5 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-subtle text-brand-primary flex items-center justify-center shrink-0">
                <HiDocumentText className="w-5 h-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-neutral-900 truncate max-w-xs sm:max-w-md">
                  {fileName}
                </span>
                <span className="text-xs text-neutral-400 mt-0.5">
                  {fileSize} • {pages.length} pages
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (fileBuffer) void releasePdfDocument(fileBuffer);
                setHasFile(false);
                setFileBuffer(null);
                setPages([]);
              }}
              className="text-xs font-semibold text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Choose different file
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 border border-neutral-200 rounded-2xl bg-white p-4 sm:p-5 shadow-2xs">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-100">
                <span className="text-xs font-semibold text-neutral-800">
                  Page order and rotations ({pages.length})
                </span>
                <span className="text-xs text-neutral-500">
                  Drag & drop to reorder • Hover to rotate
                </span>
              </div>

              <div className="max-h-[75vh] overflow-y-auto pr-1">
                <OrganizePageGrid
                  pages={pages}
                  setPages={setPages}
                  onMovePage={movePage}
                  onRotatePage={rotatePage}
                  onDeletePage={deletePage}
                />
              </div>
            </div>

            <div className="lg:col-span-4 lg:sticky lg:top-6 self-start">
              <div className="rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-xs flex flex-col gap-5">
                <div className="space-y-3">
                  <span className="text-xs font-semibold text-neutral-700 block">
                    Bulk actions
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => rotateAll(-90)}
                      className="py-2.5 px-3 rounded-xl border border-neutral-200 bg-neutral-50/50 hover:bg-neutral-100 text-xs font-semibold text-neutral-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <LuRotateCcw className="w-3.5 h-3.5" />
                      <span>Rotate Left</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => rotateAll(90)}
                      className="py-2.5 px-3 rounded-xl border border-neutral-200 bg-neutral-50/50 hover:bg-neutral-100 text-xs font-semibold text-neutral-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <LuRotateCw className="w-3.5 h-3.5" />
                      <span>Rotate Right</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={resetAll}
                    className="w-full py-2 px-3 rounded-xl border border-neutral-200 hover:bg-neutral-100 text-xs font-semibold text-neutral-600 transition-colors cursor-pointer text-center"
                  >
                    Reset Order & Rotations
                  </button>
                </div>

                <hr className="border-neutral-100" />

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-neutral-700 block">
                    Document summary
                  </span>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-500">Output pages:</span>
                    <span className="font-bold text-brand-primary">{pages.length} {pages.length === 1 ? "page" : "pages"}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-500">Initial size:</span>
                    <span className="font-semibold text-neutral-800">{fileSize}</span>
                  </div>
                </div>

                <hr className="border-neutral-100" />

                <div className="space-y-2.5">
                  <button
                    type="button"
                    disabled={pages.length === 0 || isOrganizing}
                    onClick={handleSaveOrganized}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-primary py-3.5 px-4 text-sm font-bold text-white shadow-sm hover:bg-brand-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 cursor-pointer"
                  >
                    {isOrganizing ? (
                      <>
                        <HiArrowPath className="w-4 h-4 animate-spin" />
                        <span>Saving PDF...</span>
                      </>
                    ) : (
                      <>
                        <span>Save Organized PDF</span>
                        <HiArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-neutral-400 text-center leading-relaxed">
                    All organizing executes locally in your browser.
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
