"use client";

import { useState } from "react";
import Image from "next/image";
import {
  HiDocumentText,
  HiArrowPath,
  HiCheckCircle,
  HiExclamationTriangle,
  HiArrowRight,
  HiSquares2X2,
} from "react-icons/hi2";
import { DropZone } from "./DropZone";
import { formatFileSize, validatePdfFile } from "@/lib/pdf/validation";
import { extractPdfMetadata } from "@/lib/pdf/metadata";
import { renderPageThumbnail } from "@/lib/pdf/render";
import {
  addPageNumbersAndDownload,
  type PageNumberPosition,
  type PageNumberFormat,
} from "@/lib/pdf/pageNumbers";

const POSITIONS: Array<{ id: PageNumberPosition; label: string; gridArea: string }> = [
  { id: "top-left", label: "Top Left", gridArea: "1 / 1" },
  { id: "top-center", label: "Top Center", gridArea: "1 / 2" },
  { id: "top-right", label: "Top Right", gridArea: "1 / 3" },
  { id: "bottom-left", label: "Bottom Left", gridArea: "2 / 1" },
  { id: "bottom-center", label: "Bottom Center", gridArea: "2 / 2" },
  { id: "bottom-right", label: "Bottom Right", gridArea: "2 / 3" },
];

const COLOR_PRESETS = [
  { label: "Dark Gray", value: "#333333" },
  { label: "Deep Black", value: "#000000" },
  { label: "Muted Gray", value: "#666666" },
  { label: "Burgundy", value: "#800020" },
];

export function PageNumbersView() {
  const [hasFile, setHasFile] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [previewThumb, setPreviewThumb] = useState<string>("");

  const [position, setPosition] = useState<PageNumberPosition>("bottom-center");
  const [format, setFormat] = useState<PageNumberFormat>("page-n-of-total");
  const [fontSize, setFontSize] = useState<number>(11);
  const [colorHex, setColorHex] = useState<string>("#333333");
  const [skipFirstPage, setSkipFirstPage] = useState<boolean>(false);
  const [startNumber, setStartNumber] = useState<number>(1);

  const [isProcessing, setIsProcessing] = useState(false);
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

      const thumb = await renderPageThumbnail(buffer, 1, { width: 280, height: 380, quality: 0.85 });
      setPreviewThumb(thumb);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to read PDF document.";
      setErrorMessage(msg);
    }
  };

  const getPreviewText = () => {
    const num = startNumber;
    switch (format) {
      case "page-n-of-total":
        return `Page ${num} of ${pageCount}`;
      case "n-slash-total":
        return `${num} / ${pageCount}`;
      case "page-n":
        return `Page ${num}`;
      case "n":
      default:
        return `${num}`;
    }
  };

  const handleProcess = async () => {
    if (!fileBuffer || isProcessing) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await addPageNumbersAndDownload(fileBuffer, fileName, {
        position,
        format,
        fontSize,
        colorHex,
        skipFirstPage,
        startNumber,
      });

      setSuccessMessage("Page numbers successfully added to your document!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to add page numbers.";
      setErrorMessage(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAll = () => {
    setHasFile(false);
    setFileName("");
    setFileSize(0);
    setPageCount(0);
    setFileBuffer(null);
    setPreviewThumb("");
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  return (
    <main className="w-full max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-8 flex flex-col">
      <div className="flex flex-col mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight mb-1.5">
          Add page numbers to PDF
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500">
          Insert customizable page numbers, position them, and format numbers directly in your browser.
        </p>
      </div>

      {!hasFile ? (
        <DropZone onFilesSelected={handleFilesSelected} />
      ) : (
        <div className="flex flex-col gap-6">
          {/* File Overview */}
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

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Options Settings Panel (Left 7 Cols) */}
            <div className="md:col-span-7 flex flex-col gap-5 bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-xs">
              <h2 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-3">
                Page Numbering Configuration
              </h2>

              {/* Position Selector */}
              <div className="flex flex-col space-y-2">
                <label className="text-xs font-bold text-neutral-700">
                  Placement on Page
                </label>
                <div className="grid grid-cols-3 gap-2 bg-neutral-100/70 p-3 rounded-2xl border border-neutral-200/60 max-w-md">
                  {POSITIONS.map((pos) => {
                    const isSelected = position === pos.id;
                    return (
                      <button
                        key={pos.id}
                        type="button"
                        onClick={() => setPosition(pos.id)}
                        className={`py-3 px-2 rounded-xl text-xs font-semibold flex flex-col items-center justify-center transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#800020] text-white shadow-xs"
                            : "bg-white text-neutral-700 hover:bg-neutral-50 border border-neutral-200/60"
                        }`}
                      >
                        <span>{pos.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Number Format */}
              <div className="flex flex-col space-y-2">
                <label className="text-xs font-bold text-neutral-700">Text Format</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as PageNumberFormat)}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-neutral-200 bg-neutral-50/50 text-neutral-800 focus:outline-hidden focus:border-[#800020] focus:ring-1 focus:ring-[#800020]"
                >
                  <option value="page-n-of-total">Page 1 of {pageCount} (Standard Full)</option>
                  <option value="n-slash-total">1 / {pageCount} (Fractional)</option>
                  <option value="page-n">Page 1 (Prefix Only)</option>
                  <option value="n">1 (Simple Number)</option>
                </select>
              </div>

              {/* Font Size & Color */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col space-y-2">
                  <label className="text-xs font-bold text-neutral-700">Font Size ({fontSize} pt)</label>
                  <input
                    type="range"
                    min="9"
                    max="18"
                    step="1"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full accent-[#800020] cursor-pointer"
                  />
                </div>

                <div className="flex flex-col space-y-2">
                  <label className="text-xs font-bold text-neutral-700">Text Color</label>
                  <div className="flex items-center gap-2">
                    {COLOR_PRESETS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setColorHex(c.value)}
                        title={c.label}
                        className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                          colorHex === c.value
                            ? "border-[#800020] scale-110 shadow-xs"
                            : "border-transparent hover:scale-105"
                        }`}
                        style={{ backgroundColor: c.value }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Cover Page & Start Number */}
              <div className="pt-2 border-t border-neutral-100 flex flex-col space-y-3">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={skipFirstPage}
                    onChange={(e) => setSkipFirstPage(e.target.checked)}
                    className="w-4 h-4 rounded-sm border-neutral-300 text-[#800020] focus:ring-[#800020] accent-[#800020]"
                  />
                  <span className="text-xs font-semibold text-neutral-800">
                    Skip first page (Cover / Title Page)
                  </span>
                </label>

                <div className="flex items-center gap-3">
                  <label className="text-xs text-neutral-600 font-medium">
                    Start counting from:
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={startNumber}
                    onChange={(e) => setStartNumber(Math.max(1, Number(e.target.value) || 1))}
                    className="w-20 px-2.5 py-1.5 text-xs rounded-lg border border-neutral-200 bg-neutral-50/50 text-neutral-800"
                  />
                </div>
              </div>
            </div>

            {/* Live Visual Preview (Right 5 Cols) */}
            <div className="md:col-span-5 flex flex-col bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-xs items-center justify-between">
              <div className="w-full text-center pb-3 border-b border-neutral-100">
                <span className="text-xs font-bold text-neutral-800">Interactive Preview</span>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Simulated preview of document placement
                </p>
              </div>

              {/* Document Mockup with Badge Overlay */}
              <div className="relative my-6 w-56 aspect-3/4 bg-white border border-neutral-300 rounded-xl shadow-md overflow-hidden flex items-center justify-center">
                {previewThumb ? (
                  <Image
                    src={previewThumb}
                    alt="Page Preview"
                    fill
                    unoptimized
                    className="object-contain p-1"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-neutral-400 gap-1">
                    <HiSquares2X2 className="w-8 h-8 animate-pulse text-neutral-300" />
                    <span className="text-[10px]">Loading preview...</span>
                  </div>
                )}

                {/* Simulated Number Badge */}
                <div
                  className={`absolute px-2 py-0.5 rounded-sm bg-white/95 border border-neutral-200 shadow-xs font-sans font-medium pointer-events-none transition-all duration-200 ${
                    position.startsWith("top") ? "top-3" : "bottom-3"
                  } ${
                    position.endsWith("left")
                      ? "left-3"
                      : position.endsWith("right")
                      ? "right-3"
                      : "left-1/2 -translate-x-1/2"
                  }`}
                  style={{
                    color: colorHex,
                    fontSize: `${Math.max(8, fontSize - 2)}px`,
                  }}
                >
                  {getPreviewText()}
                </div>
              </div>

              <div className="w-full pt-2">
                <button
                  type="button"
                  onClick={handleProcess}
                  disabled={isProcessing}
                  className="w-full py-3 px-6 rounded-xl bg-[#800020] text-white font-bold text-sm hover:bg-[#68001a] transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <HiArrowPath className="w-4 h-4 animate-spin" />
                      <span>Applying Numbers...</span>
                    </>
                  ) : (
                    <>
                      <span>Apply Page Numbers</span>
                      <HiArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
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
