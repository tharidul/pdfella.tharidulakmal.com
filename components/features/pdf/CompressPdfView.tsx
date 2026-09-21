"use client";

import { useState } from "react";
import {
  HiDocumentText,
  HiArrowRight,
  HiInformationCircle,
  HiArrowPath,
  HiCheckCircle,
} from "react-icons/hi2";
import { DropZone } from "./DropZone";
import {
  validatePdfFile,
  extractPdfMetadata,
  compressAndDownloadPdf,
  estimateCompressedSize,
  formatFileSize,
  type CompressionTier,
  type CompressPdfResult,
} from "@/lib/pdf";

interface CompressionOptionView {
  id: CompressionTier;
  title: string;
  description: string;
  reductionPercentage: number;
}

const COMPRESSION_OPTIONS: CompressionOptionView[] = [
  {
    id: "extreme",
    title: "Extreme Compression",
    description: "Lower image quality, highest file reduction",
    reductionPercentage: 75,
  },
  {
    id: "recommended",
    title: "Recommended Compression",
    description: "Good quality, standard compression for everyday sharing",
    reductionPercentage: 55,
  },
  {
    id: "less",
    title: "Less Compression",
    description: "High image quality, mild compression",
    reductionPercentage: 30,
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actualResult, setActualResult] = useState<CompressPdfResult | null>(null);

  const currentOption =
    COMPRESSION_OPTIONS.find((opt) => opt.id === selectedTier) ??
    COMPRESSION_OPTIONS[1];

  const currentEstimate = estimateCompressedSize(originalBytes, selectedTier);

  const handleFilesSelected = async (files: FileList) => {
    const file = files[0];
    if (!file) return;

    setErrorMessage(null);
    setActualResult(null);

    const validation = await validatePdfFile(file);
    if (!validation.isValid) {
      setErrorMessage(validation.error);
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
      setErrorMessage(msg);
    }
  };

  const handleCompress = async () => {
    if (!fileBuffer || isCompressing) return;

    setIsCompressing(true);
    setErrorMessage(null);
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
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Compression failed.";
      setErrorMessage(msg);
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

      {errorMessage && (
        <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-[#800020] flex items-center justify-between">
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-neutral-400 hover:text-neutral-700 font-bold ml-3 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {actualResult && (
        <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex flex-col space-y-1">
          <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
            <HiCheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Compression Complete</span>
          </div>
          <p className="text-emerald-700 pl-7">
            Original: {actualResult.savings.formattedOriginal} → Output:{" "}
            <strong>{actualResult.savings.formattedCompressed}</strong> (
            {actualResult.savings.formattedSaved} saved, -
            {actualResult.savings.savingsPercentage}%)
          </p>
        </div>
      )}

      {!hasFile ? (
        <DropZone onFilesSelected={handleFilesSelected} />
      ) : (
        <div className="flex flex-col space-y-6">
          <div className="border border-neutral-200 rounded-xl bg-white p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-[#fdf2f4] text-[#800020] flex items-center justify-center shrink-0">
                <HiDocumentText className="w-6 h-6" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-neutral-900 truncate">
                  {fileName}
                </span>
                <span className="text-xs text-neutral-400 mt-0.5">
                  Original: {formatFileSize(originalBytes)}, {pageCount} pages
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setHasFile(false);
                setFileBuffer(null);
                setErrorMessage(null);
                setActualResult(null);
              }}
              className="text-xs font-semibold text-[#800020] hover:text-[#66001a] flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-100 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer shrink-0 self-end sm:self-auto"
            >
              <HiArrowPath className="w-3.5 h-3.5" />
              <span>Change file</span>
            </button>
          </div>

          <div className="border border-neutral-200 rounded-2xl bg-white p-4 sm:p-6 shadow-2xs flex flex-col space-y-6">
            <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
              Choose Compression Level
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {COMPRESSION_OPTIONS.map((option) => {
                const isSelected = option.id === selectedTier;
                const optEstimate = estimateCompressedSize(originalBytes, option.id);

                return (
                  <div
                    key={option.id}
                    onClick={() => setSelectedTier(option.id)}
                    className={`relative rounded-xl p-5 border cursor-pointer select-none transition-colors duration-150 flex flex-col justify-between ${
                      isSelected
                        ? "border-[#800020] bg-[#fdf2f4] shadow-xs ring-1 ring-[#800020]/20"
                        : "border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-2xs"
                    }`}
                  >
                    <div>
                      <h2 className="text-sm font-bold text-neutral-900 mb-2">
                        {option.title}
                      </h2>
                      <p className="text-xs text-neutral-500 mb-4 leading-relaxed">
                        {option.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs text-neutral-400 font-medium">
                          Estimated Size
                        </span>
                        <span className="text-sm font-bold text-[#800020]">
                          ~{optEstimate.formattedEstimatedSize}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-[#800020] bg-[#fdf2f4] px-2 py-0.5 rounded-md">
                        -{option.reductionPercentage}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/80 flex flex-col space-y-3">
              <div className="flex items-center justify-between text-xs font-medium text-neutral-700">
                <span>File Size Preview</span>
                <span>
                  Expected savings: ~{currentEstimate.formattedEstimatedSavings} (
                  {currentOption.reductionPercentage}%)
                </span>
              </div>

              <div className="w-full bg-neutral-200 h-2.5 rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${100 - currentOption.reductionPercentage}%` }}
                  className="bg-[#800020] h-full transition-[width] duration-200"
                />
                <div
                  style={{ width: `${currentOption.reductionPercentage}%` }}
                  className="bg-neutral-300 h-full transition-[width] duration-200"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-neutral-400">
                <span>Original: {formatFileSize(originalBytes)}</span>
                <span>Estimated: ~{currentEstimate.formattedEstimatedSize}</span>
              </div>
            </div>
          </div>

          <div className="w-full rounded-2xl p-4 bg-[#fdf2f4] border border-[#f8cfd5] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-3.5">
              <div className="w-7 h-7 rounded-full bg-[#800020] text-white flex items-center justify-center shrink-0">
                <HiInformationCircle className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-bold text-[#800020] leading-tight">
                  {isCompressing
                    ? progressMsg || "Compressing document..."
                    : "Ready to compress"}
                </span>
                <span className="text-xs text-neutral-600 leading-tight mt-0.5">
                  Compressing with {currentOption.title.toLowerCase()} (~
                  {currentOption.reductionPercentage}% estimated reduction).
                </span>
              </div>
            </div>

            <button
              type="button"
              disabled={isCompressing || !fileBuffer}
              onClick={handleCompress}
              className={`w-full sm:w-auto justify-center px-7 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 shadow-xs transition-colors duration-150 ${
                !isCompressing && fileBuffer
                  ? "bg-[#800020] hover:bg-[#66001a] text-white cursor-pointer"
                  : "bg-neutral-300 text-neutral-500 cursor-not-allowed"
              }`}
            >
              <span>{isCompressing ? "Compressing..." : "Compress PDF"}</span>
              <HiArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
