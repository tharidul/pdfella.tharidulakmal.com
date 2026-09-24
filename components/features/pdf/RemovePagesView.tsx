"use client";

import { useState } from "react";
import Image from "next/image";
import { HiTrash } from "react-icons/hi2";
import { toast } from "@/components/ui/sonner";
import { DropZone } from "./DropZone";
import { removeAndDownloadPdfPages } from "@/lib/pdf/remove";
import { usePageSelection } from "./hooks/usePageSelection";
import { PdfToolLayout, PdfFileHeader, PrimaryActionButton, PrivacyFooter } from "./shared";

export function RemovePagesView() {
  const {
    hasFile,
    fileName,
    fileSize,
    fileBuffer,
    pages,
    rangeInput,
    selectedCount: markedCount,
    togglePage,
    clearSelection: handleClearMarks,
    handleRangeInputChange,
    handleFilesSelected,
    handleReset,
  } = usePageSelection(false);

  const [isRemoving, setIsRemoving] = useState(false);

  const remainingCount = pages.length - markedCount;
  const isAllMarked = markedCount === pages.length;

  const handleRemovePages = async () => {
    if (!fileBuffer || isRemoving) return;

    const markedNums = pages.filter((p) => p.selected).map((p) => p.number);
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

  return (
    <PdfToolLayout
      hasFile={hasFile}
      heading="Delete unwanted pages from PDF"
      subheading="Click the pages you wish to delete and generate a pruned, clean document."
    >
      {!hasFile ? (
        <DropZone onFilesSelected={handleFilesSelected} />
      ) : (
        <div className="space-y-6">
          <PdfFileHeader
            fileName={fileName}
            fileSize={fileSize}
            pageCount={pages.length}
            onReset={handleReset}
          />

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
                      page.selected
                        ? "border-2 border-brand-primary shadow-xs"
                        : "border border-neutral-200 hover:border-neutral-300"
                    }`}
                  >
                    <div className="w-full flex items-center justify-between mb-2">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          page.selected
                            ? "bg-brand-primary text-white"
                            : "bg-neutral-100 text-neutral-600"
                        }`}
                      >
                        {page.number}
                      </span>
                      {page.selected && (
                        <div className="w-4 h-4 rounded-full bg-brand-primary text-white flex items-center justify-center">
                          <HiTrash className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>

                    <div className="w-full flex-1 bg-white border border-neutral-100 rounded p-1.5 flex flex-col justify-between relative overflow-hidden">
                      {page.selected && (
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
                  <PrimaryActionButton
                    onClick={handleRemovePages}
                    disabled={markedCount === 0 || isAllMarked}
                    loading={isRemoving}
                    label="Remove Pages & Save"
                    loadingLabel="Removing Pages..."
                  />
                  <PrivacyFooter action="removal" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </PdfToolLayout>
  );
}
