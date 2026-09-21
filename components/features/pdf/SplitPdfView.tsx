"use client";

import { useState } from "react";
import {
  HiDocumentText,
  HiCheck,
  HiArrowRight,
  HiInformationCircle,
  HiArrowPath,
} from "react-icons/hi2";
import { DropZone } from "./DropZone";
import {
  validatePdfFile,
  extractPdfMetadata,
  renderPageThumbnail,
  splitAndDownloadPdf,
  formatPageRange,
  safeParsePageRange,
} from "@/lib/pdf";

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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

    setErrorMessage(null);
    const validation = await validatePdfFile(file);
    if (!validation.isValid) {
      setErrorMessage(validation.error);
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

      // Concurrently render thumbnails for the pages
      for (let p = 1; p <= metadata.pageCount; p++) {
        renderPageThumbnail(buffer, p, { width: 120, height: 160 })
          .then((thumbnailUrl) => {
            setPages((currentPages) =>
              currentPages.map((item) =>
                item.number === p ? { ...item, thumbnailUrl } : item
              )
            );
          })
          .catch(() => {
            // Keep placeholder fallback
          });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to read PDF.";
      setErrorMessage(msg);
    }
  };

  const handleExtract = async () => {
    if (!fileBuffer || isExtracting) return;

    const selectedNums = pages.filter((p) => p.selected).map((p) => p.number);
    if (selectedNums.length === 0) {
      setErrorMessage("Please select at least one page to extract.");
      return;
    }

    setIsExtracting(true);
    setErrorMessage(null);

    try {
      await splitAndDownloadPdf({
        data: fileBuffer,
        name: fileName,
        selectedPages: selectedNums,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Extraction failed.";
      setErrorMessage(msg);
    } finally {
      setIsExtracting(false);
    }
  };

  const selectedCount = pages.filter((p) => p.selected).length;

  return (
    <main className="w-full max-w-4xl mx-auto px-8 py-8 flex flex-col">
      <div className="flex flex-col mb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-[#800020] mb-1.5">
          SPLIT PDF
        </span>
        <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight mb-1.5">
          Extract pages & ranges from PDF
        </h1>
        <p className="text-sm text-neutral-500">
          Upload a PDF file, select individual pages or custom ranges, and
          extract them into a new document.
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

      {!hasFile ? (
        <DropZone onFilesSelected={handleFilesSelected} />
      ) : (
        <div className="flex flex-col space-y-6">
          <div className="border border-neutral-200 rounded-xl bg-white p-4 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-[#fdf2f4] text-[#800020] flex items-center justify-center shrink-0">
                <HiDocumentText className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-neutral-900">
                  {fileName}
                </span>
                <span className="text-xs text-neutral-400 mt-0.5">
                  {fileSize} • {pages.length} pages total
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setHasFile(false);
                setFileBuffer(null);
                setPages([]);
                setErrorMessage(null);
              }}
              className="text-xs font-semibold text-[#800020] hover:text-[#66001a] flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-100 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
            >
              <HiArrowPath className="w-3.5 h-3.5" />
              <span>Change file</span>
            </button>
          </div>

          <div className="border border-neutral-200 rounded-2xl bg-white p-6 shadow-2xs flex flex-col space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
              <div className="flex-1 max-w-md">
                <label
                  htmlFor="pageRange"
                  className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1.5"
                >
                  Page Range Syntax
                </label>
                <input
                  id="pageRange"
                  type="text"
                  value={rangeInput}
                  onChange={(e) => handleRangeInputChange(e.target.value)}
                  placeholder="e.g. 1-3, 5, 8-12"
                  className="w-full text-sm px-3.5 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:border-[#800020] focus:ring-1 focus:ring-[#800020]"
                />
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center pt-2 sm:pt-4">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors cursor-pointer"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors cursor-pointer"
                >
                  Clear Selection
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
              {pages.map((page) => (
                <div
                  key={page.number}
                  onClick={() => togglePage(page.number)}
                  className={`relative border rounded-xl p-3 flex flex-col items-center justify-between h-40 cursor-pointer select-none transition-colors duration-150 ${
                    page.selected
                      ? "border-[#800020] bg-[#fdf2f4] shadow-xs"
                      : "border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-2xs"
                  }`}
                >
                  <div className="w-full flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        page.selected
                          ? "bg-[#800020] text-white"
                          : "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      {page.number}
                    </span>
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${
                        page.selected
                          ? "bg-[#800020] text-white"
                          : "border border-neutral-300 bg-white"
                      }`}
                    >
                      {page.selected && <HiCheck className="w-3 h-3" />}
                    </div>
                  </div>

                  <div className="w-full flex-1 bg-white border border-neutral-100 rounded p-1.5 flex flex-col justify-between overflow-hidden relative">
                    {page.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={page.thumbnailUrl}
                        alt={`Page ${page.number}`}
                        className="w-full h-full object-contain"
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

          <div className="w-full rounded-2xl p-4 bg-[#fdf2f4] border border-[#f8cfd5] flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-3.5">
              <div className="w-7 h-7 rounded-full bg-[#800020] text-white flex items-center justify-center shrink-0">
                <HiInformationCircle className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-bold text-[#800020] leading-tight">
                  {isExtracting ? "Extracting pages..." : "Ready to extract"}
                </span>
                <span className="text-xs text-neutral-600 leading-tight mt-0.5">
                  {selectedCount} pages selected for the new document.
                </span>
              </div>
            </div>

            <button
              type="button"
              disabled={selectedCount === 0 || isExtracting}
              onClick={handleExtract}
              className={`px-7 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 shadow-xs transition-colors duration-150 ${
                selectedCount > 0 && !isExtracting
                  ? "bg-[#800020] hover:bg-[#66001a] text-white cursor-pointer"
                  : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
              }`}
            >
              <span>{isExtracting ? "Extracting..." : "Extract Pages"}</span>
              <HiArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
