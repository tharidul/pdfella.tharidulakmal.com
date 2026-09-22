"use client";

import { useState } from "react";
import {
  HiDocumentText,
  HiArrowRight,
  HiArrowPath,
} from "react-icons/hi2";
import { toast } from "@/components/ui/sonner";
import { DropZone } from "./DropZone";
import { formatFileSize, validatePdfFile } from "@/lib/pdf/validation";
import { extractPdfMetadata } from "@/lib/pdf/metadata";
import {
  compressAndDownloadPdf,
  type CompressionTier,
  type CompressPdfResult,
} from "@/lib/pdf/compress";

interface CompressionOptionView {
  id: CompressionTier;
  title: string;
  description: string;
}

const COMPRESSION_OPTIONS: CompressionOptionView[] = [
  {
    id: "extreme",
    title: "Extreme",
    description: "Lower image quality, highest file size reduction",
  },
  {
    id: "recommended",
    title: "Recommended",
    description: "Good quality, standard compression for everyday sharing",
  },
  {
    id: "less",
    title: "Less Compression",
    description: "High image quality, mild file size reduction",
  },
];

export function CompressPdfView() {
  const [hasFile, setHasFile] = useState(false);
  const [fileName, setFileName] = useState("");
  const [originalBytes, setOriginalBytes] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [selectedTier, setSelectedTier] = useState<CompressionTier>("recommended");
  const [isCompressing, setIsCompressing] = useState(false);
  const [progressMsg, setProgressMsg] = useState<string | null>(null);
  const [actualResult, setActualResult] = useState<CompressPdfResult | null>(null);

  const handleFilesSelected = async (files: FileList) => {
    const file = files[0];
    if (!file) return;

    setActualResult(null);

    const validation = await validatePdfFile(file);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    try {
      const buffer = await file.arrayBuffer();
      const metadata = await extractPdfMetadata(buffer, file.name);

      setFileName(file.name);
      setOriginalBytes(buffer.byteLength);
      setPageCount(metadata.pageCount);
      setFileBuffer(buffer);
      setHasFile(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to read PDF document.";
      toast.error(msg);
    }
  };

  const handleCompress = async () => {
    if (!fileBuffer || isCompressing) return;

    setIsCompressing(true);
    setActualResult(null);
    setProgressMsg("Starting compression...");

    try {
      const result = await compressAndDownloadPdf(
        {
          data: fileBuffer,
          name: fileName,
          tier: selectedTier,
        },
        (processed, total) => {
          setProgressMsg(`Compressing page ${processed} of ${total}...`);
        }
      );

      setActualResult(result);
      toast.success("PDF compressed successfully!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Compression failed.";
      toast.error(msg);
    } finally {
      setIsCompressing(false);
      setProgressMsg(null);
    }
  };

  return (
    <main className="w-full max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-8 flex flex-col">
      <div className="flex flex-col mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight mb-1.5">
          Reduce PDF file size
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500">
          Compress and optimize your PDF documents to make them lightweight for
          email and web sharing.
        </p>
      </div>

      {actualResult && (
        <div className="mb-4 p-3.5 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-800 flex flex-col gap-1 shadow-2xs">
          <div className="flex items-center gap-2 font-bold text-neutral-900">
            <span className="w-2 h-2 rounded-full bg-brand-primary shrink-0" />
            <span>Compression Complete</span>
          </div>
          <p className="text-neutral-600 pl-4">
            Original: {actualResult.savings.formattedOriginal} → Output:{" "}
            <strong className="text-neutral-900">{actualResult.savings.formattedCompressed}</strong> (
            {actualResult.savings.formattedSaved} saved, -
            {actualResult.savings.savingsPercentage}%)
          </p>
        </div>
      )}

      {!hasFile ? (
        <DropZone onFilesSelected={handleFilesSelected} />
      ) : (
        <div className="rounded-2xl border border-neutral-200/90 bg-white p-5 sm:p-6 shadow-xs flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-neutral-100">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-brand-subtle text-brand-primary flex items-center justify-center shrink-0">
                <HiDocumentText className="w-5 h-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-neutral-900 truncate max-w-xs sm:max-w-md">
                  {fileName}
                </span>
                <span className="text-xs text-neutral-400 mt-0.5">
                  {formatFileSize(originalBytes)} · {pageCount} {pageCount === 1 ? "page" : "pages"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setHasFile(false);
                setFileBuffer(null);
                setActualResult(null);
              }}
              className="text-xs font-semibold text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Change file
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              Compression Level
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {COMPRESSION_OPTIONS.map((option) => {
                const isSelected = option.id === selectedTier;

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSelectedTier(option.id)}
                    className={`text-left p-4 rounded-xl transition-all cursor-pointer flex flex-col justify-between gap-2 bg-white ${
                      isSelected
                        ? "border-2 border-brand-primary shadow-2xs"
                        : "border border-neutral-200 hover:border-neutral-300"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-neutral-900">
                          {option.title}
                        </span>
                        <span
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? "border-brand-primary bg-brand-primary"
                              : "border-neutral-300"
                          }`}
                        >
                          {isSelected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 leading-relaxed">
                        {option.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-neutral-100">
            <span className="text-xs text-neutral-400">
              All compression executes locally in your browser.
            </span>

            <button
              type="button"
              disabled={isCompressing || !fileBuffer}
              onClick={handleCompress}
              className={`w-full sm:w-auto px-7 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors ${
                !isCompressing && fileBuffer
                  ? "bg-brand-primary hover:bg-brand-primary-hover text-white cursor-pointer"
                  : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
              }`}
            >
              {isCompressing ? (
                <>
                  <HiArrowPath className="w-4 h-4 animate-spin" />
                  <span>{progressMsg || "Compressing PDF..."}</span>
                </>
              ) : (
                <>
                  <span>Compress PDF</span>
                  <HiArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
