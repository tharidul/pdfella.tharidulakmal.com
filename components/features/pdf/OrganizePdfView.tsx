"use client";

import { useState, useCallback } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { arrayMove } from "@dnd-kit/helpers";
import {
  HiDocumentText,
  HiArrowRight,
  HiInformationCircle,
  HiArrowPath,
  HiTrash,
  HiArrowLeft,
} from "react-icons/hi2";
import { LuRotateCw, LuRotateCcw } from "react-icons/lu";
import { DropZone } from "./DropZone";
import {
  validatePdfFile,
  extractPdfMetadata,
  renderPageThumbnail,
  organizeAndDownloadPdf,
  type OrganizePageOrder,
} from "@/lib/pdf";

interface OrganizeCardItem extends OrganizePageOrder {
  thumbnailUrl?: string;
}

interface SortablePageCardProps {
  page: OrganizeCardItem;
  index: number;
  totalCount: number;
  onMovePage: (index: number, direction: -1 | 1) => void;
  onRotatePage: (id: string, delta: number) => void;
  onDeletePage: (id: string) => void;
}

function SortablePageCard({
  page,
  index,
  totalCount,
  onMovePage,
  onRotatePage,
  onDeletePage,
}: SortablePageCardProps) {
  const { ref, isDragging } = useSortable({
    id: page.id,
    index,
  });

  return (
    <div
      ref={ref}
      style={{
        opacity: isDragging ? 0.4 : 1,
        transition: "opacity 150ms ease",
      }}
      className="border border-neutral-200 rounded-xl bg-white p-3 flex flex-col items-center justify-between shadow-xs hover:border-neutral-300 transition-colors duration-150 group"
    >
      <div className="w-full flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-100 text-neutral-700">
          #{index + 1} (Orig: {page.originalNumber})
        </span>
        <button
          type="button"
          aria-label="Delete page"
          disabled={totalCount <= 1}
          onClick={() => onDeletePage(page.id)}
          className={`p-1 transition-colors ${
            totalCount <= 1
              ? "text-neutral-200 cursor-not-allowed"
              : "text-neutral-400 hover:text-red-600 cursor-pointer"
          }`}
        >
          <HiTrash className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="w-full h-36 bg-[#fbfbfb] border border-neutral-200/60 rounded-md p-2 flex flex-col justify-between overflow-hidden relative">
        <div
          style={{ transform: `rotate(${page.rotation}deg)` }}
          className="w-full h-full flex flex-col justify-between transition-transform duration-200"
        >
          {page.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={page.thumbnailUrl}
              alt={`Page ${page.originalNumber}`}
              className="w-full h-full object-contain"
            />
          ) : (
            <>
              <div className="space-y-1 mt-1">
                <div className="h-1 bg-neutral-200 rounded-full w-full" />
                <div className="h-1 bg-neutral-200 rounded-full w-4/5" />
                <div className="h-1 bg-neutral-200 rounded-full w-2/3" />
              </div>
              <span className="text-[9px] text-center text-neutral-400 font-medium">
                Page {page.originalNumber}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="w-full flex items-center justify-between mt-3 pt-2 border-t border-neutral-100">
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Move previous"
            disabled={index === 0}
            onClick={() => onMovePage(index, -1)}
            className={`p-1 rounded ${
              index === 0
                ? "text-neutral-300 cursor-not-allowed"
                : "text-neutral-600 hover:bg-neutral-100 cursor-pointer"
            }`}
          >
            <HiArrowLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            aria-label="Move next"
            disabled={index === totalCount - 1}
            onClick={() => onMovePage(index, 1)}
            className={`p-1 rounded ${
              index === totalCount - 1
                ? "text-neutral-300 cursor-not-allowed"
                : "text-neutral-600 hover:bg-neutral-100 cursor-pointer"
            }`}
          >
            <HiArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Rotate counter-clockwise"
            onClick={() => onRotatePage(page.id, -90)}
            className="p-1.5 rounded-md hover:bg-neutral-100 text-neutral-600 transition-colors cursor-pointer"
          >
            <LuRotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            aria-label="Rotate clockwise"
            onClick={() => onRotatePage(page.id, 90)}
            className="p-1.5 rounded-md hover:bg-neutral-100 text-neutral-600 transition-colors cursor-pointer"
          >
            <LuRotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function OrganizePdfView() {
  const [hasFile, setHasFile] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [pages, setPages] = useState<OrganizeCardItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isOrganizing, setIsOrganizing] = useState(false);

  const rotatePage = useCallback((id: string, delta: number) => {
    setPages((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, rotation: (p.rotation + delta + 360) % 360 } : p
      )
    );
  }, []);

  const movePage = useCallback((index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    setPages((prev) => {
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      return arrayMove(prev, index, targetIndex);
    });
  }, []);

  const deletePage = useCallback((id: string) => {
    setPages((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((p) => p.id !== id);
    });
  }, []);

  const rotateAll = useCallback((delta: number) => {
    setPages((prev) =>
      prev.map((p) => ({ ...p, rotation: (p.rotation + delta + 360) % 360 }))
    );
  }, []);

  const resetAll = useCallback(() => {
    if (!fileBuffer) return;
    setPages((prev) =>
      [...prev]
        .sort((a, b) => a.originalNumber - b.originalNumber)
        .map((p) => ({ ...p, rotation: 0 }))
    );
  }, [fileBuffer]);

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

      const initialPages: OrganizeCardItem[] = Array.from(
        { length: metadata.pageCount },
        (_, i) => ({
          id: `org-page-${Date.now()}-${i + 1}`,
          originalNumber: i + 1,
          rotation: 0,
        })
      );

      setFileName(file.name);
      setFileSize(metadata.formattedSize);
      setFileBuffer(buffer);
      setPages(initialPages);
      setHasFile(true);

      // Render thumbnails for each page
      for (let p = 1; p <= metadata.pageCount; p++) {
        renderPageThumbnail(buffer, p, { width: 140, height: 180 })
          .then((thumbnailUrl) => {
            setPages((currentPages) =>
              currentPages.map((item) =>
                item.originalNumber === p ? { ...item, thumbnailUrl } : item
              )
            );
          })
          .catch(() => {
            // Keep fallback
          });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load PDF.";
      setErrorMessage(msg);
    }
  };

  const handleSaveOrganized = async () => {
    if (!fileBuffer || pages.length === 0 || isOrganizing) return;

    setIsOrganizing(true);
    setErrorMessage(null);

    try {
      await organizeAndDownloadPdf({
        data: fileBuffer,
        name: fileName,
        pages,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Organize operation failed.";
      setErrorMessage(msg);
    } finally {
      setIsOrganizing(false);
    }
  };

  return (
    <main className="w-full max-w-4xl mx-auto px-8 py-8 flex flex-col">
      <div className="flex flex-col mb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-[#800020] mb-1.5">
          ORGANIZE PDF
        </span>
        <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight mb-1.5">
          Reorder, rotate & manage PDF pages
        </h1>
        <p className="text-sm text-neutral-500">
          Reorder pages, rotate individual sheets, and delete unwanted pages
          before creating the final document.
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
                  {fileSize} • {pages.length} pages
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
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                Page Sequence & Orientation
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => rotateAll(-90)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LuRotateCcw className="w-3.5 h-3.5" />
                  <span>Rotate All Left</span>
                </button>
                <button
                  type="button"
                  onClick={() => rotateAll(90)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LuRotateCw className="w-3.5 h-3.5" />
                  <span>Rotate All Right</span>
                </button>
                <button
                  type="button"
                  onClick={resetAll}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>

            <DragDropProvider
              onDragEnd={(event) => {
                const { source, target } = event.operation;
                if (source && target && source.id !== target.id) {
                  const fromIndex = pages.findIndex((p) => p.id === source.id);
                  const toIndex = pages.findIndex((p) => p.id === target.id);
                  if (fromIndex !== -1 && toIndex !== -1) {
                    setPages((prev) => arrayMove(prev, fromIndex, toIndex));
                  }
                }
              }}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {pages.map((page, index) => (
                  <SortablePageCard
                    key={page.id}
                    page={page}
                    index={index}
                    totalCount={pages.length}
                    onMovePage={movePage}
                    onRotatePage={rotatePage}
                    onDeletePage={deletePage}
                  />
                ))}
              </div>
            </DragDropProvider>
          </div>

          <div className="w-full rounded-2xl p-4 bg-[#fdf2f4] border border-[#f8cfd5] flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-3.5">
              <div className="w-7 h-7 rounded-full bg-[#800020] text-white flex items-center justify-center shrink-0">
                <HiInformationCircle className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-bold text-[#800020] leading-tight">
                  {isOrganizing ? "Saving organized PDF..." : "Ready to organize"}
                </span>
                <span className="text-xs text-neutral-600 leading-tight mt-0.5">
                  {pages.length} pages will be compiled in the chosen order and
                  orientations.
                </span>
              </div>
            </div>

            <button
              type="button"
              disabled={pages.length === 0 || isOrganizing}
              onClick={handleSaveOrganized}
              className={`px-7 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 shadow-xs transition-colors duration-150 ${
                pages.length > 0 && !isOrganizing
                  ? "bg-[#800020] hover:bg-[#66001a] text-white cursor-pointer"
                  : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
              }`}
            >
              <span>{isOrganizing ? "Saving..." : "Save Organized PDF"}</span>
              <HiArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
