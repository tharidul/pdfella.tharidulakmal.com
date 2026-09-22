"use client";

import { useState } from "react";
import Image from "next/image";
import {
  HiDocumentText,
  HiCheck,
  HiArrowRight,
  HiArrowPath,
} from "react-icons/hi2";
import { toast } from "@/components/ui/sonner";
import { DropZone } from "./DropZone";
import { validatePdfFile } from "@/lib/pdf/validation";
import { extractPdfMetadata } from "@/lib/pdf/metadata";
import { renderDocumentThumbnailsBatch, releasePdfDocument } from "@/lib/pdf/render";
import { splitAndDownloadPdf } from "@/lib/pdf/split";
import { formatPageRange, safeParsePageRange } from "@/lib/pdf/range";

interface PageItem {
  number: number;
  selected: boolean;
  thumbnailUrl?: string;
}

export function SplitPdfView() {
  const [hasFile, setHasFile] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [rangeInput, setRangeInput] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);

  const updateRangeString = (updatedPages: PageItem[]) => {
    const selectedNums = updatedPages
      .filter((p) => p.selected)
      .map((p) => p.number);
    setRangeInput(formatPageRange(selectedNums));
  };

  const togglePage = (pageNumber: number) => {
    setPages((prev) => {
      const updated = prev.map((p) =>
        p.number === pageNumber ? { ...p, selected: !p.selected } : p
      );
      updateRangeString(updated);
      return updated;
    });
  };

  const handleSelectAll = () => {
    const updated = pages.map((p) => ({ ...p, selected: true }));
    setPages(updated);
    updateRangeString(updated);
  };

  const handleClearSelection = () => {
    const updated = pages.map((p) => ({ ...p, selected: false }));
    setPages(updated);
    setRangeInput("");
  };

  const handleRangeInputChange = (value: string) => {
    setRangeInput(value);
    if (!value.trim()) {
      setPages((prev) => prev.map((p) => ({ ...p, selected: false })));
      return;
    }

    const parseRes = safeParsePageRange(value, pages.length);
    if (parseRes.isValid) {
      const selectedSet = new Set(parseRes.pages);
      setPages((prev) =>
        prev.map((p) => ({
          ...p,
          selected: selectedSet.has(p.number),
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

      const initialPages: PageItem[] = Array.from(
        { length: metadata.pageCount },
        (_, i) => ({
          number: i + 1,
          selected: true,
        })
      );

      setFileName(file.name);
      setFileSize(metadata.formattedSize);
      setFileBuffer(buffer);
      setPages(initialPages);
      setRangeInput(formatPageRange(initialPages.map((p) => p.number)));
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
      const msg = err instanceof Error ? err.message : "Failed to read PDF.";
      toast.error(msg);
    }
  };

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

  const selectedCount = pages.filter((p) => p.selected).length;

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
          Extract pages & ranges from PDF
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500">
          Upload a PDF file, select individual pages or custom ranges, and
          extract them into a new document.
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
                <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                  Document Pages ({pages.length})
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
                    className={`relative rounded-xl p-3 flex flex-col items-center justify-between h-40 cursor-pointer select-none transition-all bg-white ${
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
                    className="text-xs font-bold uppercase tracking-wider text-neutral-500 block"
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
                      onClick={handleSelectAll}
                      className="flex-1 text-xs font-semibold py-1.5 px-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors cursor-pointer text-center"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={handleClearSelection}
                      className="flex-1 text-xs font-semibold py-1.5 px-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors cursor-pointer text-center"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <hr className="border-neutral-100" />

                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block">
                    Selection Summary
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
                  <button
                    type="button"
                    disabled={selectedCount === 0 || isExtracting}
                    onClick={handleExtract}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-primary py-3.5 px-4 text-sm font-bold text-white shadow-sm hover:bg-brand-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer hover:shadow"
                  >
                    {isExtracting ? (
                      <>
                        <HiArrowPath className="w-4 h-4 animate-spin" />
                        <span>Extracting Pages...</span>
                      </>
                    ) : (
                      <>
                        <span>Extract Pages</span>
                        <HiArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-neutral-400 text-center leading-relaxed">
                    All extraction executes locally in your browser.
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
