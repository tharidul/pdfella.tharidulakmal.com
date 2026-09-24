"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  HiDocumentText,
  HiArrowDownTray,
  HiArrowPath,
  HiSquares2X2,
} from "react-icons/hi2";
import { toast } from "@/components/ui/sonner";
import { DropZone } from "./DropZone";
import { formatFileSize, validatePdfFile } from "@/lib/pdf/validation";
import { extractPdfMetadata } from "@/lib/pdf/metadata";
import { renderDocumentThumbnailsBatch, releasePdfDocument } from "@/lib/pdf/render";
import {
  convertPdfToImagesZip,
  downloadSinglePageImage,
  renderPdfPageToImage,
  type ImageFormat,
  type ImageResolution,
} from "@/lib/pdf/pdfToImage";

interface PageCardItem {
  pageNumber: number;
  thumbnailUrl: string;
  selected: boolean;
}

export function PdfToImageView() {
  const [hasFile, setHasFile] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);

  const [format, setFormat] = useState<ImageFormat>("png");
  const [resolution, setResolution] = useState<ImageResolution>("standard");
  const [pages, setPages] = useState<PageCardItem[]>([]);

  const [isExportingZip, setIsExportingZip] = useState(false);
  const [exportingPageNum, setExportingPageNum] = useState<number | null>(null);
  const [progressMsg, setProgressMsg] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

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

      setFileName(file.name);
      setFileSize(buffer.byteLength);
      setPageCount(metadata.pageCount);
      setFileBuffer(buffer);
      setHasFile(true);

      const initialPages: PageCardItem[] = [];
      for (let i = 1; i <= metadata.pageCount; i++) {
        initialPages.push({
          pageNumber: i,
          thumbnailUrl: "",
          selected: true,
        });
      }
      setPages(initialPages);

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      loadThumbnails(buffer, metadata.pageCount, controller.signal);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to read PDF document.";
      toast.error(msg);
    }
  };

  const loadThumbnails = async (buffer: ArrayBuffer, total: number, signal: AbortSignal) => {
    const pageNumbers = Array.from({ length: total }, (_, i) => i + 1);
    await renderDocumentThumbnailsBatch(
      buffer,
      pageNumbers,
      { width: 180, height: 240, quality: 0.8 },
      (batch) => {
        if (signal.aborted) return;
        setPages((prev) =>
          prev.map((p) => {
            const thumb = batch[p.pageNumber];
            return thumb ? { ...p, thumbnailUrl: thumb } : p;
          })
        );
      },
      8,
      signal
    );
  };

  const togglePageSelection = (pageNumber: number) => {
    setPages((prev) =>
      prev.map((p) => (p.pageNumber === pageNumber ? { ...p, selected: !p.selected } : p))
    );
  };

  const selectAll = (selected: boolean) => {
    setPages((prev) => prev.map((p) => ({ ...p, selected })));
  };

  const selectedCount = pages.filter((p) => p.selected).length;

  const handleDownloadSingle = async (pageNumber: number) => {
    if (!fileBuffer || exportingPageNum !== null || isExportingZip) return;

    setExportingPageNum(pageNumber);

    try {
      const scale = resolution === "standard" ? 1.5 : 2.5;
      const rendered = await renderPdfPageToImage(fileBuffer, pageNumber, {
        format,
        scale,
      });

      downloadSinglePageImage(rendered, fileName, format);
      toast.success(`Downloaded page ${pageNumber} as ${format.toUpperCase()}.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : `Failed to export page ${pageNumber}.`;
      toast.error(msg);
    } finally {
      setExportingPageNum(null);
    }
  };

  const handleDownloadZip = async () => {
    if (!fileBuffer || isExportingZip) return;

    const selectedNumbers = pages.filter((p) => p.selected).map((p) => p.pageNumber);
    if (selectedNumbers.length === 0) {
      toast.error("Please select at least one page to download.");
      return;
    }

    setIsExportingZip(true);

    try {
      await convertPdfToImagesZip(fileBuffer, fileName, {
        format,
        resolution,
        selectedPages: selectedNumbers,
        onProgress: (cur, tot) => {
          setProgressMsg(`Rendering page ${cur} of ${tot}...`);
        },
      });

      toast.success(`Successfully packaged ${selectedNumbers.length} pages into a ZIP file!`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to bundle images into ZIP.";
      toast.error(msg);
    } finally {
      setIsExportingZip(false);
      setProgressMsg(null);
    }
  };

  const resetAll = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    if (fileBuffer) void releasePdfDocument(fileBuffer);
    setHasFile(false);
    setFileName("");
    setFileSize(0);
    setPageCount(0);
    setFileBuffer(null);
    setPages([]);
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
          Extract PDF pages as images
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500">
          Convert PDF pages into PNG or JPG images, or download all pages in a single ZIP file.
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
                  {formatFileSize(fileSize)} • {pageCount} pages
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={resetAll}
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
                  Select pages to package or download individual images
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[75vh] overflow-y-auto pr-1">
                {pages.map((p) => (
                  <div
                    key={p.pageNumber}
                    onClick={() => togglePageSelection(p.pageNumber)}
                    className={`group relative rounded-xl p-2 flex flex-col bg-white shadow-xs transition-colors duration-150 cursor-pointer select-none ${
                      p.selected
                        ? "border-2 border-brand-primary"
                        : "border border-neutral-200 hover:border-neutral-300"
                    }`}
                  >
                    <div className="relative w-full aspect-3/4 bg-neutral-50 flex items-center justify-center overflow-hidden rounded-lg">
                      {p.thumbnailUrl ? (
                        <Image
                          src={p.thumbnailUrl}
                          alt={`Page ${p.pageNumber}`}
                          fill
                          unoptimized
                          className="object-contain p-2"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-neutral-400 gap-1">
                          <HiSquares2X2 className="w-8 h-8 animate-pulse text-neutral-300" />
                          <span className="text-[10px]">Loading preview...</span>
                        </div>
                      )}
                    </div>

                    <div
                      className={`absolute top-3.5 right-3.5 w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold transition-colors ${
                        p.selected
                          ? "bg-brand-primary text-white"
                          : "bg-white/80 border border-neutral-300 text-transparent"
                      }`}
                    >
                      ✓
                    </div>

                    <div className="pt-2 px-1 flex items-center justify-between">
                      <span className="text-xs font-semibold text-neutral-700">
                        Page {p.pageNumber}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadSingle(p.pageNumber);
                        }}
                        disabled={exportingPageNum === p.pageNumber}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-primary hover:bg-brand-subtle px-2 py-1 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {exportingPageNum === p.pageNumber ? (
                          <HiArrowPath className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <HiArrowDownTray className="w-3.5 h-3.5" />
                        )}
                        <span>{format.toUpperCase()}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4 lg:sticky lg:top-6 self-start">
              <div className="rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-xs flex flex-col gap-5">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-700 block">
                      Image format
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormat("png")}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                          format === "png"
                            ? "bg-brand-primary text-white border-brand-primary"
                            : "bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100"
                        }`}
                      >
                        PNG (Crisp)
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormat("jpeg")}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                          format === "jpeg"
                            ? "bg-brand-primary text-white border-brand-primary"
                            : "bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100"
                        }`}
                      >
                        JPG (Compact)
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-700 block">
                      Resolution
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setResolution("standard")}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                          resolution === "standard"
                            ? "bg-brand-primary text-white border-brand-primary"
                            : "bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100"
                        }`}
                      >
                        Standard (150 DPI)
                      </button>
                      <button
                        type="button"
                        onClick={() => setResolution("high")}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                          resolution === "high"
                            ? "bg-brand-primary text-white border-brand-primary"
                            : "bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100"
                        }`}
                      >
                        High-Res (300 DPI)
                      </button>
                    </div>
                  </div>
                </div>

                <hr className="border-neutral-100" />

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-700">
                      Selection summary
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => selectAll(true)}
                        className="text-xs font-semibold text-brand-primary hover:underline cursor-pointer"
                      >
                        All
                      </button>
                      <span className="text-neutral-300">|</span>
                      <button
                        type="button"
                        onClick={() => selectAll(false)}
                        className="text-xs font-semibold text-neutral-500 hover:underline cursor-pointer"
                      >
                        None
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-500">Selected pages:</span>
                    <span className="font-bold text-brand-primary">{selectedCount} of {pages.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-500">Output package:</span>
                    <span className="font-semibold text-neutral-800">
                      {selectedCount} {selectedCount === 1 ? "image" : "images"} in .ZIP
                    </span>
                  </div>
                </div>

                <hr className="border-neutral-100" />

                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={handleDownloadZip}
                    disabled={isExportingZip || selectedCount === 0}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-primary py-3.5 px-4 text-sm font-bold text-white shadow-sm hover:bg-brand-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 cursor-pointer"
                  >
                    {isExportingZip ? (
                      <>
                        <HiArrowPath className="w-4 h-4 animate-spin" />
                        <span>{progressMsg ?? "Exporting ZIP Archive..."}</span>
                      </>
                    ) : (
                      <>
                        <HiArrowDownTray className="w-4 h-4" />
                        <span>Download Selected as ZIP</span>
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-neutral-400 text-center leading-relaxed">
                    All image extraction executes locally in your browser.
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
