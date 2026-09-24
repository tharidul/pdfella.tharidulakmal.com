"use client";

import { useState } from "react";
import Image from "next/image";
import { HiCheck } from "react-icons/hi2";
import { toast } from "@/components/ui/sonner";
import { DropZone } from "./DropZone";
import { splitAndDownloadPdf } from "@/lib/pdf/split";
import { usePageSelection } from "./hooks/usePageSelection";
import { PdfToolLayout, PdfFileHeader, PrimaryActionButton, PrivacyFooter } from "./shared";

export function SplitPdfView() {
  const {
    hasFile,
    fileName,
    fileSize,
    fileBuffer,
    pages,
    rangeInput,
    selectedCount,
    togglePage,
    selectAll,
    clearSelection,
    handleRangeInputChange,
    handleFilesSelected,
    handleReset,
  } = usePageSelection(true);

  const [isExtracting, setIsExtracting] = useState(false);

  const handleExtract = async () => {
    if (!fileBuffer || isExtracting) return;

    const selectedNums = pages.filter((p) => p.selected).map((p) => p.number);
    if (selectedNums.length === 0) {
      toast.error("Please select at least one page to extract.");
      return;
    }

    setIsExtracting(true);

    try {
      await splitAndDownloadPdf({
        data: fileBuffer,
        name: fileName,
        selectedPages: selectedNums,
      });
      toast.success("Pages extracted and downloaded successfully!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Extraction failed.";
      toast.error(msg);
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <PdfToolLayout
      hasFile={hasFile}
      heading="Extract pages & ranges from PDF"
      subheading="Upload a PDF file, select individual pages or custom ranges, and extract them into a new document."
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
                  Click to select pages to extract
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
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${
                          page.selected
                            ? "bg-brand-primary text-white"
                            : "border border-neutral-300 bg-white"
                        }`}
                      >
                        {page.selected && <HiCheck className="w-3 h-3" />}
                      </div>
                    </div>

                    <div className="w-full flex-1 bg-white border border-neutral-100 rounded p-1.5 flex flex-col justify-between overflow-hidden relative">
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
                    htmlFor="pageRange"
                    className="text-xs font-semibold text-neutral-700 block"
                  >
                    Page Range Syntax
                  </label>
                  <input
                    id="pageRange"
                    type="text"
                    value={rangeInput}
                    onChange={(e) => handleRangeInputChange(e.target.value)}
                    placeholder="e.g. 1-3, 5, 8-12"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-neutral-200 bg-neutral-50/50 text-neutral-800 font-medium focus:outline-hidden focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                  />
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={selectAll}
                      className="flex-1 text-xs font-semibold py-1.5 px-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors cursor-pointer text-center"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={clearSelection}
                      className="flex-1 text-xs font-semibold py-1.5 px-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors cursor-pointer text-center"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <hr className="border-neutral-100" />

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-neutral-700 block">
                    Selection summary
                  </span>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-500">Selected pages:</span>
                    <span className="font-bold text-brand-primary">{selectedCount} of {pages.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-500">Output document:</span>
                    <span className="font-semibold text-neutral-800">
                      {selectedCount} {selectedCount === 1 ? "page" : "pages"}
                    </span>
                  </div>
                </div>

                <hr className="border-neutral-100" />

                <div className="space-y-2.5">
                  <PrimaryActionButton
                    onClick={handleExtract}
                    disabled={selectedCount === 0}
                    loading={isExtracting}
                    label="Extract Pages"
                    loadingLabel="Extracting Pages..."
                  />
                  <PrivacyFooter action="extraction" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </PdfToolLayout>
  );
}
