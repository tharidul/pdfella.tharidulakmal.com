"use client";

import { useState } from "react";
import Image from "next/image";
import {
  HiDocumentText,
  HiArrowDownTray,
  HiArrowPath,
  HiCheckCircle,
  HiExclamationTriangle,
  HiSquares2X2,
} from "react-icons/hi2";
import { DropZone } from "./DropZone";
import { formatFileSize, validatePdfFile } from "@/lib/pdf/validation";
import { extractPdfMetadata } from "@/lib/pdf/metadata";
import { renderPageThumbnail } from "@/lib/pdf/render";
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFilesSelected = async (files: FileList) => {
    const file = files[0];
    if (!file) return;

    setErrorMessage(null);
    setSuccessMessage(null);

    const validation = await validatePdfFile(file);
    if (!validation.isValid) {
      setErrorMessage(validation.error);
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

      // Pre-populate page items
      const initialPages: PageCardItem[] = [];
      for (let i = 1; i <= metadata.pageCount; i++) {
        initialPages.push({
          pageNumber: i,
          thumbnailUrl: "",
          selected: true,
        });
      }
      setPages(initialPages);

      // Load thumbnails progressively
      loadThumbnails(buffer, metadata.pageCount);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to read PDF document.";
      setErrorMessage(msg);
    }
  };

  const loadThumbnails = async (buffer: ArrayBuffer, total: number) => {
    for (let i = 1; i <= total; i++) {
      try {
        const url = await renderPageThumbnail(buffer, i, { width: 180, height: 240, quality: 0.8 });
        setPages((prev) =>
          prev.map((p) => (p.pageNumber === i ? { ...p, thumbnailUrl: url } : p))
        );
      } catch {
        // Continue rendering subsequent thumbnails
      }
    }
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
    setErrorMessage(null);

    try {
      const scale = resolution === "standard" ? 1.5 : 2.5;
      const rendered = await renderPdfPageToImage(fileBuffer, pageNumber, {
        format,
        scale,
      });

      downloadSinglePageImage(rendered, fileName, format);
      setSuccessMessage(`Downloaded page ${pageNumber} as ${format.toUpperCase()}.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : `Failed to export page ${pageNumber}.`;
      setErrorMessage(msg);
    } finally {
      setExportingPageNum(null);
    }
  };

  const handleDownloadZip = async () => {
    if (!fileBuffer || isExportingZip) return;

    const selectedNumbers = pages.filter((p) => p.selected).map((p) => p.pageNumber);
    if (selectedNumbers.length === 0) {
      setErrorMessage("Please select at least one page to download.");
      return;
    }

    setIsExportingZip(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await convertPdfToImagesZip(fileBuffer, fileName, {
        format,
        resolution,
        selectedPages: selectedNumbers,
        onProgress: (cur, tot) => {
          setProgressMsg(`Rendering page ${cur} of ${tot}...`);
        },
      });

      setSuccessMessage(`Successfully packaged ${selectedNumbers.length} pages into a ZIP file!`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to bundle images into ZIP.";
      setErrorMessage(msg);
    } finally {
      setIsExportingZip(false);
      setProgressMsg(null);
    }
  };

  const resetAll = () => {
    setHasFile(false);
    setFileName("");
    setFileSize(0);
    setPageCount(0);
    setFileBuffer(null);
    setPages([]);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  return (
    <main className="w-full max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-8 flex flex-col">
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
        <div className="flex flex-col gap-6">
          {/* File Overview & Controls */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#fdf2f4] text-[#800020] flex items-center justify-center shrink-0">
                <HiDocumentText className="w-6 h-6" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-neutral-900 truncate max-w-xs sm:max-w-md">
                  {fileName}
                </span>
                <span className="text-xs text-neutral-400">
                  {pageCount} {pageCount === 1 ? "page" : "pages"}, {formatFileSize(fileSize)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={resetAll}
              className="text-xs font-semibold text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Choose Different File
            </button>
          </div>

          {/* Options Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-xs">
            {/* Format Selection */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-bold text-neutral-700">Image Format</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormat("png")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                    format === "png"
                      ? "bg-[#800020] text-white border-[#800020]"
                      : "bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100"
                  }`}
                >
                  PNG (Lossless, Crisp)
                </button>
                <button
                  type="button"
                  onClick={() => setFormat("jpeg")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                    format === "jpeg"
                      ? "bg-[#800020] text-white border-[#800020]"
                      : "bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100"
                  }`}
                >
                  JPG (Compact Size)
                </button>
              </div>
            </div>

            {/* Resolution Selection */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-bold text-neutral-700">Image Resolution</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setResolution("standard")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                    resolution === "standard"
                      ? "bg-[#800020] text-white border-[#800020]"
                      : "bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100"
                  }`}
                >
                  Standard (150 DPI)
                </button>
                <button
                  type="button"
                  onClick={() => setResolution("high")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                    resolution === "high"
                      ? "bg-[#800020] text-white border-[#800020]"
                      : "bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100"
                  }`}
                >
                  High Res (300 DPI)
                </button>
              </div>
            </div>
          </div>

          {/* Selection Bar */}
          <div className="flex items-center justify-between text-xs text-neutral-600 px-1">
            <span className="font-semibold text-neutral-800">
              {selectedCount} of {pageCount} pages selected
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => selectAll(true)}
                className="hover:text-[#800020] font-semibold transition-colors cursor-pointer"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={() => selectAll(false)}
                className="hover:text-[#800020] font-semibold transition-colors cursor-pointer"
              >
                Deselect All
              </button>
            </div>
          </div>

          {/* Rendered Page Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {pages.map((p) => (
              <div
                key={p.pageNumber}
                onClick={() => togglePageSelection(p.pageNumber)}
                className={`relative flex flex-col bg-white border-2 rounded-2xl overflow-hidden cursor-pointer transition-all shadow-2xs hover:shadow-md ${
                  p.selected
                    ? "border-[#800020] ring-2 ring-[#800020]/20"
                    : "border-neutral-200 opacity-75"
                }`}
              >
                {/* Page Image */}
                <div className="relative w-full aspect-3/4 bg-neutral-50 flex items-center justify-center overflow-hidden">
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

                {/* Checkbox indicator */}
                <div
                  className={`absolute top-2 right-2 w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold ${
                    p.selected
                      ? "bg-[#800020] text-white"
                      : "bg-neutral-200 text-transparent border border-neutral-300"
                  }`}
                >
                  ✓
                </div>

                {/* Footer / Download Single */}
                <div className="p-2.5 bg-white border-t border-neutral-100 flex items-center justify-between">
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
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#800020] hover:bg-[#fdf2f4] px-2 py-1 rounded-md transition-colors cursor-pointer disabled:opacity-50"
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

          {/* Execution Bar */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col text-center sm:text-left">
              <span className="text-sm font-bold text-neutral-900">
                Package All Selected Pages
              </span>
              <span className="text-xs text-neutral-500 mt-0.5">
                Download {selectedCount} {selectedCount === 1 ? "image" : "images"} packed inside a single .ZIP file.
              </span>
            </div>

            <button
              type="button"
              onClick={handleDownloadZip}
              disabled={isExportingZip || selectedCount === 0}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#800020] text-white font-bold text-sm hover:bg-[#68001a] transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
          </div>
        </div>
      )}

      {/* Notifications */}
      {errorMessage && (
        <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2.5">
          <HiExclamationTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="mt-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
          <HiCheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
    </main>
  );
}
