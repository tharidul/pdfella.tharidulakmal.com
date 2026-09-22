"use client";

import { useState } from "react";
import Image from "next/image";
import {
  HiDocumentText,
  HiArrowPath,
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
import { Select, type SelectOption } from "@/components/ui/Select";
import { toast } from "@/components/ui/sonner";

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

const getFormatOptions = (total: number): readonly SelectOption[] => [
  {
    value: "page-n-of-total",
    label: `Page 1 of ${total || 2} (Standard Full)`,
  },
  {
    value: "n-slash-total",
    label: `1 / ${total || 2} (Fractional)`,
  },
  {
    value: "page-n",
    label: "Page 1 (Prefix Only)",
  },
  {
    value: "n",
    label: "1 (Simple Number)",
  },
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

      const thumb = await renderPageThumbnail(buffer, 1, { width: 280, height: 380, quality: 0.85 });
      setPreviewThumb(thumb);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to read PDF document.";
      toast.error(msg);
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

    try {
      await addPageNumbersAndDownload(fileBuffer, fileName, {
        position,
        format,
        fontSize,
        colorHex,
        skipFirstPage,
        startNumber,
      });

      toast.success("Page numbers successfully added to your document!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to add page numbers.";
      toast.error(msg);
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
          Add page numbers to PDF
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500">
          Insert customizable page numbers, position them, and format numbers directly in your browser.
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
                  {formatFileSize(fileSize)} • {pageCount} {pageCount === 1 ? "page" : "pages"}
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

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-7 flex flex-col bg-white rounded-2xl border border-neutral-200/80 p-5 sm:p-6 shadow-2xs items-center justify-between">
              <div className="w-full text-center pb-3 border-b border-neutral-100">
                <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                  Real-Time Document Preview
                </span>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Visual approximation of page number placement on Page 1
                </p>
              </div>

              <div className="relative my-6 w-64 sm:w-80 aspect-[1/1.414] bg-white border border-neutral-300 rounded-xl shadow-md overflow-hidden flex items-center justify-center select-none">
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

                <div
                  className={`absolute px-2 py-0.5 rounded-sm border border-dotted border-neutral-400/60 bg-white/40 font-sans font-medium pointer-events-none transition-all duration-200 ${
                    position.startsWith("top") ? "top-4" : "bottom-4"
                  } ${
                    position.endsWith("left")
                      ? "left-4"
                      : position.endsWith("right")
                      ? "right-4"
                      : "left-1/2 -translate-x-1/2"
                  }`}
                  style={{
                    color: colorHex,
                    fontSize: `${Math.max(10, fontSize)}px`,
                  }}
                >
                  {getPreviewText()}
                </div>
              </div>
            </div>

            <div className="md:col-span-5 md:sticky md:top-6 self-start">
              <div className="flex flex-col gap-5 bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block mb-3">
                    Page Numbering Configuration
                  </span>

                  <div className="flex flex-col space-y-2">
                    <label className="text-xs font-bold text-neutral-700">
                      Placement on Page
                    </label>
                    <div className="grid grid-cols-3 gap-2 bg-neutral-100/70 p-2.5 rounded-xl border border-neutral-200/60">
                      {POSITIONS.map((pos) => {
                        const isSelected = position === pos.id;
                        return (
                          <button
                            key={pos.id}
                            type="button"
                            onClick={() => setPosition(pos.id)}
                            className={`py-2 px-1.5 rounded-lg text-xs font-semibold flex flex-col items-center justify-center transition-all cursor-pointer ${
                              isSelected
                                ? "bg-brand-primary text-white shadow-xs"
                                : "bg-white text-neutral-700 hover:bg-neutral-50 border border-neutral-200/60"
                            }`}
                          >
                            <span>{pos.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-bold text-neutral-700">Text Format</label>
                  <Select
                    value={format}
                    onChange={(val) => setFormat(val as PageNumberFormat)}
                    options={getFormatOptions(pageCount)}
                    triggerClassName="py-2.5 px-3.5 text-xs rounded-xl border border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50 text-neutral-800"
                  />
                </div>

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
                      className="w-full accent-brand-primary cursor-pointer"
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
                              ? "border-brand-primary scale-110 shadow-xs"
                              : "border-transparent hover:scale-105"
                          }`}
                          style={{ backgroundColor: c.value }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-100 flex flex-col space-y-3">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={skipFirstPage}
                      onChange={(e) => setSkipFirstPage(e.target.checked)}
                      className="w-4 h-4 rounded-sm border-neutral-300 text-brand-primary focus:ring-brand-primary accent-brand-primary"
                    />
                    <span className="text-xs font-semibold text-neutral-800">
                      Skip first page (Cover / Title Page)
                    </span>
                  </label>

                  <div className="flex items-center justify-between">
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

                <hr className="border-neutral-100" />

                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={handleProcess}
                    disabled={isProcessing}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-primary py-3.5 px-4 text-sm font-bold text-white shadow-sm hover:bg-brand-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer hover:shadow"
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

                  <p className="text-[11px] text-neutral-400 text-center leading-relaxed">
                    All page numbering executes locally in your browser.
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
