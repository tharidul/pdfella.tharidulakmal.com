"use client";

import { useState } from "react";
import Image from "next/image";
import {
  HiDocumentText,
  HiTrash,
  HiArrowRight,
  HiArrowPath,
} from "react-icons/hi2";
import { toast } from "@/components/ui/sonner";
import { DropZone } from "./DropZone";
import { validatePdfFile } from "@/lib/pdf/validation";
import { extractPdfMetadata } from "@/lib/pdf/metadata";
import { renderDocumentThumbnailsBatch, releasePdfDocument } from "@/lib/pdf/render";
import { removeAndDownloadPdfPages } from "@/lib/pdf/remove";
import { formatPageRange, safeParsePageRange } from "@/lib/pdf/range";

interface RemovePageItem {
  number: number;
  markedForRemoval: boolean;
  thumbnailUrl?: string;
}

export function RemovePagesView() {
  const [hasFile, setHasFile] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [pages, setPages] = useState<RemovePageItem[]>([]);
  const [rangeInput, setRangeInput] = useState("");
  const [isRemoving, setIsRemoving] = useState(false);

  const updateRangeString = (updatedPages: RemovePageItem[]) => {
    const markedNums = updatedPages
      .filter((p) => p.markedForRemoval)
      .map((p) => p.number);
    setRangeInput(formatPageRange(markedNums));
  };

  const togglePage = (pageNumber: number) => {
    setPages((prev) => {
      const updated = prev.map((p) =>
        p.number === pageNumber
          ? { ...p, markedForRemoval: !p.markedForRemoval }
          : p
      );
      updateRangeString(updated);
      return updated;
    });
  };

  const handleClearMarks = () => {
    const updated = pages.map((p) => ({ ...p, markedForRemoval: false }));
    setPages(updated);
    setRangeInput("");
  };

  const handleRangeInputChange = (value: string) => {
    setRangeInput(value);
    if (!value.trim()) {
      setPages((prev) => prev.map((p) => ({ ...p, markedForRemoval: false })));
      return;
    }

    const parseRes = safeParsePageRange(value, pages.length);
    if (parseRes.isValid) {
      const markedSet = new Set(parseRes.pages);
      setPages((prev) =>
        prev.map((p) => ({
          ...p,
          markedForRemoval: markedSet.has(p.number),
        }))
      );
    }
  };

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

      const initialPages: RemovePageItem[] = Array.from(
        { length: metadata.pageCount },
        (_, i) => ({
          number: i + 1,
          markedForRemoval: false,
        })
      );

      setFileName(file.name);
      setFileSize(metadata.formattedSize);
      setFileBuffer(buffer);
      setPages(initialPages);
      setRangeInput("");
      setHasFile(true);

      const pageNumbers = Array.from({ length: metadata.pageCount }, (_, i) => i + 1);
      void renderDocumentThumbnailsBatch(
        buffer,
        pageNumbers,
        { width: 120, height: 160 },
        (batch) => {
          setPages((currentPages) =>
            currentPages.map((item) =>
              batch[item.number] ? { ...item, thumbnailUrl: batch[item.number] } : item
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

  const handleRemovePages = async () => {
    if (!fileBuffer || isRemoving) return;

    const markedNums = pages.filter((p) => p.markedForRemoval).map((p) => p.number);
    if (markedNums.length === 0) {
      toast.error("Please mark at least one page to delete.");
      return;
    }

    if (markedNums.length >= pages.length) {
      toast.error("Cannot delete all pages. At least one page must remain.");
      return;
    }

    setIsRemoving(true);

    try {
      const res = await removeAndDownloadPdfPages({
        data: fileBuffer,
        name: fileName,
        pagesToRemove: markedNums,
      });

      toast.success(
        `${res.removedCount} ${res.removedCount === 1 ? "page" : "pages"} removed. ${res.remainingCount} ${res.remainingCount === 1 ? "page" : "pages"} remaining.`
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Page removal failed.";
      toast.error(msg);
    } finally {
      setIsRemoving(false);
    }
  };

  const markedCount = pages.filter((p) => p.markedForRemoval).length;
  const remainingCount = pages.length - markedCount;
  const isAllMarked = markedCount === pages.length;

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
          Delete unwanted pages from PDF
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500">
          Click the pages you wish to delete and generate a pruned, clean
          document.
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
                  Document pages ({pages.length})
                </span>
                <span className="text-xs text-neutral-500">
                  Click pages to mark for deletion
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[75vh] overflow-y-auto pr-1">
                {pages.map((page) => (
                  <div
                    key={page.number}
                    onClick={() => togglePage(page.number)}
                    className={`relative rounded-xl p-3 flex flex-col items-center justify-between h-40 cursor-pointer select-none transition-colors duration-150 bg-white ${
                      page.markedForRemoval
                        ? "border-2 border-brand-primary shadow-xs"
                        : "border border-neutral-200 hover:border-neutral-300"
                    }`}
                  >
                    <div className="w-full flex items-center justify-between mb-2">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          page.markedForRemoval
                            ? "bg-brand-primary text-white"
                            : "bg-neutral-100 text-neutral-600"
                        }`}
                      >
                        {page.number}
                      </span>
                      {page.markedForRemoval && (
                        <div className="w-4 h-4 rounded-full bg-brand-primary text-white flex items-center justify-center">
                          <HiTrash className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>

                    <div className="w-full flex-1 bg-white border border-neutral-100 rounded p-1.5 flex flex-col justify-between relative overflow-hidden">
                      {page.markedForRemoval && (
                        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                          <span className="text-[10px] font-semibold text-brand-primary bg-white border border-brand-primary px-2 py-0.5 rounded shadow-xs">
                            Remove
                          </span>
                        </div>
                      )}

                      {page.thumbnailUrl ? (
                        <Image
                          src={page.thumbnailUrl}
                          alt={`Page ${page.number}`}
                          fill
                          unoptimized
                          className="object-contain"
                        />
                      ) : (
                        <>
                          <div className="space-y-1">
                            <div className="h-1 bg-neutral-200 rounded-full w-full" />
                            <div className="h-1 bg-neutral-200 rounded-full w-4/5" />
                            <div className="h-1 bg-neutral-200 rounded-full w-2/3" />
                          </div>
                          <span className="text-[9px] text-center text-neutral-400 font-medium">
                            Page {page.number}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4 lg:sticky lg:top-6 self-start">
              <div className="rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-xs flex flex-col gap-5">
                <div className="space-y-2">
                  <label
                    htmlFor="removeRange"
                    className="text-xs font-semibold text-neutral-700 block"
                  >
                    Pages to Delete
                  </label>
                  <input
                    id="removeRange"
                    type="text"
                    value={rangeInput}
                    onChange={(e) => handleRangeInputChange(e.target.value)}
                    placeholder="e.g. 2, 4-6"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-neutral-200 bg-neutral-50/50 text-neutral-800 font-medium focus:outline-hidden focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                  />
                  {markedCount > 0 && (
                    <button
                      type="button"
                      onClick={handleClearMarks}
                      className="w-full text-xs font-semibold py-1.5 px-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors cursor-pointer text-center mt-1"
                    >
                      Clear All Marks
                    </button>
                  )}
                </div>

                {isAllMarked && (
                  <div className="p-3 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-800 flex items-center gap-2 shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-brand-primary shrink-0" />
                    <span className="font-semibold text-neutral-900">Notice:</span>
                    <span>At least one page must remain in the final PDF.</span>
                  </div>
                )}

                <hr className="border-neutral-100" />

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-neutral-700 block">
                    Removal summary
                  </span>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-500">Pages to remove:</span>
                    <span className="font-bold text-brand-primary">{markedCount} of {pages.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-500">Pages remaining:</span>
                    <span className="font-semibold text-neutral-800">
                      {remainingCount} {remainingCount === 1 ? "page" : "pages"}
                    </span>
                  </div>
                </div>

                <hr className="border-neutral-100" />

                <div className="space-y-2.5">
                  <button
                    type="button"
                    disabled={markedCount === 0 || isAllMarked || isRemoving}
                    onClick={handleRemovePages}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-primary py-3.5 px-4 text-sm font-bold text-white shadow-sm hover:bg-brand-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 cursor-pointer"
                  >
                    {isRemoving ? (
                      <>
                        <HiArrowPath className="w-4 h-4 animate-spin" />
                        <span>Removing Pages...</span>
                      </>
                    ) : (
                      <>
                        <span>Remove Pages & Save</span>
                        <HiArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-neutral-400 text-center leading-relaxed">
                    All removal executes locally in your browser.
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
