"use client";

import { useState } from "react";
import {
  HiDocumentText,
  HiTrash,
  HiArrowRight,
  HiInformationCircle,
  HiArrowPath,
  HiExclamationCircle,
  HiCheckCircle,
} from "react-icons/hi2";
import { DropZone } from "./DropZone";
import {
  validatePdfFile,
  extractPdfMetadata,
  renderPageThumbnail,
  removeAndDownloadPdfPages,
  formatPageRange,
  safeParsePageRange,
} from "@/lib/pdf";

interface RemovePageItem {
  number: number;
  markedForRemoval: boolean;
  thumbnailUrl?: string;
}

export function RemovePagesView() {
  const [hasFile, setHasFile] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [pages, setPages] = useState<RemovePageItem[]>([]);
  const [rangeInput, setRangeInput] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successSummary, setSuccessSummary] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const updateRangeString = (updatedPages: RemovePageItem[]) => {
    const markedNums = updatedPages
      .filter((p) => p.markedForRemoval)
      .map((p) => p.number);
    setRangeInput(formatPageRange(markedNums));
  };

  const togglePage = (pageNumber: number) => {
    setPages((prev) => {
      const updated = prev.map((p) =>
        p.number === pageNumber
          ? { ...p, markedForRemoval: !p.markedForRemoval }
          : p
      );
      updateRangeString(updated);
      return updated;
    });
  };

  const handleClearMarks = () => {
    const updated = pages.map((p) => ({ ...p, markedForRemoval: false }));
    setPages(updated);
    setRangeInput("");
  };

  const handleRangeInputChange = (value: string) => {
    setRangeInput(value);
    if (!value.trim()) {
      setPages((prev) => prev.map((p) => ({ ...p, markedForRemoval: false })));
      return;
    }

    const parseRes = safeParsePageRange(value, pages.length);
    if (parseRes.isValid) {
      const markedSet = new Set(parseRes.pages);
      setPages((prev) =>
        prev.map((p) => ({
          ...p,
          markedForRemoval: markedSet.has(p.number),
        }))
      );
    }
  };

  const handleFilesSelected = async (files: FileList) => {
    const file = files[0];
    if (!file) return;

    setErrorMessage(null);
    setSuccessSummary(null);

    const validation = await validatePdfFile(file);
    if (!validation.isValid) {
      setErrorMessage(validation.error);
      return;
    }

    try {
      const buffer = await file.arrayBuffer();
      const metadata = await extractPdfMetadata(buffer, file.name);

      const initialPages: RemovePageItem[] = Array.from(
        { length: metadata.pageCount },
        (_, i) => ({
          number: i + 1,
          markedForRemoval: false,
        })
      );

      setFileName(file.name);
      setFileSize(metadata.formattedSize);
      setFileBuffer(buffer);
      setPages(initialPages);
      setRangeInput("");
      setHasFile(true);

      // Concurrently render page thumbnails
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
      const msg = err instanceof Error ? err.message : "Failed to load PDF.";
      setErrorMessage(msg);
    }
  };

  const handleRemovePages = async () => {
    if (!fileBuffer || isRemoving) return;

    const markedNums = pages.filter((p) => p.markedForRemoval).map((p) => p.number);
    if (markedNums.length === 0) {
      setErrorMessage("Please mark at least one page to delete.");
      return;
    }

    if (markedNums.length >= pages.length) {
      setErrorMessage("Cannot delete all pages. At least one page must remain.");
      return;
    }

    setIsRemoving(true);
    setErrorMessage(null);
    setSuccessSummary(null);

    try {
      const res = await removeAndDownloadPdfPages({
        data: fileBuffer,
        name: fileName,
        pagesToRemove: markedNums,
      });

      setSuccessSummary(
        `${res.removedCount} ${res.removedCount === 1 ? "page" : "pages"} removed. ${res.remainingCount} ${res.remainingCount === 1 ? "page" : "pages"} remaining.`
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Page removal failed.";
      setErrorMessage(msg);
    } finally {
      setIsRemoving(false);
    }
  };

  const markedCount = pages.filter((p) => p.markedForRemoval).length;
  const remainingCount = pages.length - markedCount;
  const isAllMarked = markedCount === pages.length;

  return (
    <main className="w-full max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-8 flex flex-col">
      <div className="flex flex-col mb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-[#800020] mb-1.5">
          REMOVE PAGES
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight mb-1.5">
          Delete unwanted pages from PDF
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500">
          Click the pages you wish to delete and generate a pruned, clean
          document.
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

      {successSummary && (
        <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <HiCheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successSummary}</span>
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
                setSuccessSummary(null);
              }}
              className="text-xs font-semibold text-[#800020] hover:text-[#66001a] flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-100 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer shrink-0 self-end sm:self-auto"
            >
              <HiArrowPath className="w-3.5 h-3.5" />
              <span>Change file</span>
            </button>
          </div>

          <div className="border border-neutral-200 rounded-2xl bg-white p-4 sm:p-6 shadow-2xs flex flex-col space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
              <div className="flex-1 max-w-md">
                <label
                  htmlFor="removeRange"
                  className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1.5"
                >
                  Pages to Delete
                </label>
                <input
                  id="removeRange"
                  type="text"
                  value={rangeInput}
                  onChange={(e) => handleRangeInputChange(e.target.value)}
                  placeholder="e.g. 2, 4-6"
                  className="w-full text-sm px-3.5 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:border-[#800020] focus:ring-1 focus:ring-[#800020]"
                />
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center pt-2 sm:pt-4">
                <button
                  type="button"
                  onClick={handleClearMarks}
                  className="text-xs font-semibold px-3.5 py-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors cursor-pointer"
                >
                  Clear Marks
                </button>
              </div>
            </div>

            {isAllMarked && (
              <div className="flex items-center gap-2 p-3 bg-neutral-50 border border-neutral-300 rounded-xl text-neutral-800 text-xs">
                <HiExclamationCircle className="w-4 h-4 shrink-0 text-neutral-600" />
                <span>
                  You cannot delete all pages. At least one page must remain in
                  the final PDF.
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
              {pages.map((page) => (
                <div
                  key={page.number}
                  onClick={() => togglePage(page.number)}
                  className={`relative border rounded-xl p-3 flex flex-col items-center justify-between h-40 cursor-pointer select-none transition-colors duration-150 ${
                    page.markedForRemoval
                      ? "border-[#800020] bg-[#fdf2f4] shadow-2xs"
                      : "border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-2xs"
                  }`}
                >
                  <div className="w-full flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        page.markedForRemoval
                          ? "bg-[#800020] text-white"
                          : "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      {page.number}
                    </span>
                    {page.markedForRemoval && (
                      <div className="w-5 h-5 rounded-full bg-[#800020] text-white flex items-center justify-center">
                        <HiTrash className="w-3 h-3" />
                      </div>
                    )}
                  </div>

                  <div className="w-full flex-1 bg-white border border-neutral-100 rounded p-1.5 flex flex-col justify-between relative overflow-hidden">
                    {page.markedForRemoval && (
                      <div className="absolute inset-0 bg-[#800020]/10 flex items-center justify-center z-10">
                        <span className="text-[10px] font-bold text-[#800020] bg-white border border-[#f8cfd5] px-2 py-0.5 rounded uppercase tracking-wider">
                          Delete
                        </span>
                      </div>
                    )}

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

          <div className="w-full rounded-2xl p-4 bg-[#fdf2f4] border border-[#f8cfd5] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-3.5">
              <div className="w-7 h-7 rounded-full bg-[#800020] text-white flex items-center justify-center shrink-0">
                <HiInformationCircle className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-bold text-[#800020] leading-tight">
                  {isRemoving ? "Removing pages..." : "Ready to remove"}
                </span>
                <span className="text-xs text-neutral-600 leading-tight mt-0.5">
                  {markedCount} pages will be removed. {remainingCount} pages will
                  be saved in the output file.
                </span>
              </div>
            </div>

            <button
              type="button"
              disabled={markedCount === 0 || isAllMarked || isRemoving}
              onClick={handleRemovePages}
              className={`w-full sm:w-auto justify-center px-7 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 shadow-xs transition-colors duration-150 ${
                markedCount > 0 && !isAllMarked && !isRemoving
                  ? "bg-[#800020] hover:bg-[#66001a] text-white cursor-pointer"
                  : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
              }`}
            >
              <span>{isRemoving ? "Removing..." : "Remove Pages & Save"}</span>
              <HiArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
