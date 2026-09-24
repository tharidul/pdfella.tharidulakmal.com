"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { HiDocumentText, HiArrowPath } from "react-icons/hi2";
import { FaSignature } from "react-icons/fa6";
import { toast } from "@/components/ui/sonner";
import { DropZone } from "./DropZone";
import { formatFileSize, validatePdfFile } from "@/lib/pdf/validation";
import { extractPdfMetadata } from "@/lib/pdf/metadata";
import { renderPageThumbnail, releasePdfDocument } from "@/lib/pdf/render";
import { signAndDownloadPdf } from "@/lib/pdf/sign";
import { SignaturePlacementOverlay } from "./SignaturePlacementOverlay";
import { useSignaturePlacements } from "./signature/useSignaturePlacements";
import { PdfViewerToolbar } from "./signature/PdfViewerToolbar";
import { SignaturesSidebar } from "./signature/SignaturesSidebar";

const SignaturePadModal = dynamic(
  () => import("./SignaturePadModal").then((m) => m.SignaturePadModal),
  { ssr: false }
);

export function SignPdfView() {
  const [hasFile, setHasFile] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [activePage, setActivePage] = useState(1);
  const [pageInputStr, setPageInputStr] = useState("1");
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [previewThumb, setPreviewThumb] = useState<string | null>(null);
  const [isLoadingThumb, setIsLoadingThumb] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [aspectRatio, setAspectRatio] = useState(700 / 980);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const previewContainerRef = useRef<HTMLDivElement | null>(null);

  const {
    placements,
    setPlacements,
    selectedPlacementId,
    setSelectedPlacementId,
    addSignaturePlacement,
    addDateStamp,
    updatePlacement,
    deletePlacement,
    clearPlacements,
  } = useSignaturePlacements();

  const handlePageChange = useCallback(
    async (newPage: number) => {
      if (!fileBuffer || newPage < 1 || newPage > pageCount) return;
      setActivePage(newPage);
      setPageInputStr(String(newPage));
      setIsLoadingThumb(true);
      try {
        const thumb = await renderPageThumbnail(fileBuffer, newPage, {
          width: 700,
          height: 980,
          quality: 0.92,
        });
        setPreviewThumb(thumb);
      } catch {
        toast.error("Failed to render page preview.");
      } finally {
        setIsLoadingThumb(false);
      }
    },
    [fileBuffer, pageCount]
  );

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(pageInputStr.trim(), 10);
    if (!isNaN(parsed)) {
      const clamped = Math.max(1, Math.min(pageCount, parsed));
      void handlePageChange(clamped);
    } else {
      setPageInputStr(String(activePage));
    }
  };

  const handlePageInputBlur = () => {
    const parsed = parseInt(pageInputStr.trim(), 10);
    if (!isNaN(parsed)) {
      const clamped = Math.max(1, Math.min(pageCount, parsed));
      void handlePageChange(clamped);
    } else {
      setPageInputStr(String(activePage));
    }
  };

  const handleFilesSelected = async (files: FileList) => {
    const file = files[0];
    if (!file) return;

    clearPlacements();

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
      setActivePage(1);
      setPageInputStr("1");
      setHasFile(true);

      const thumb = await renderPageThumbnail(buffer, 1, {
        width: 700,
        height: 980,
        quality: 0.92,
      });
      setPreviewThumb(thumb);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load PDF document.";
      toast.error(msg);
    }
  };

  const handleReset = () => {
    if (fileBuffer) void releasePdfDocument(fileBuffer);
    setHasFile(false);
    setFileName("");
    setFileSize(0);
    setPageCount(0);
    setFileBuffer(null);
    setPreviewThumb("");
    clearPlacements();
    setZoomLevel(100);
    setAspectRatio(700 / 980);
  };

  const handleSaveSignature = (dataUrl: string, label: string) => {
    addSignaturePlacement(dataUrl, label, activePage, previewContainerRef, hasFile);
  };

  const handleAddDateStampClick = () => {
    addDateStamp(activePage, previewContainerRef);
  };

  const handleSignPdf = async () => {
    if (!fileBuffer || isProcessing) return;

    if (placements.length === 0) {
      toast.error("Please place at least one signature or stamp before downloading.");
      return;
    }

    setIsProcessing(true);

    try {
      await signAndDownloadPdf({
        data: fileBuffer,
        name: fileName,
        placements,
      });
      toast.success("Document signed and downloaded successfully!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to sign PDF document.";
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className={
        hasFile
          ? "w-full max-w-6xl mx-auto px-4 py-6 flex flex-col"
          : "w-full max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-8 flex flex-col"
      }
    >
      {!hasFile && (
        <div className="flex flex-col mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight mb-1.5">
            Sign PDF Online Free
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600">
            Draw, type, or upload electronic signatures and add date stamps. 100% private in your browser with zero server uploads.
          </p>
        </div>
      )}

      {!hasFile && (
        <div className="flex flex-col">
          <DropZone onFilesSelected={handleFilesSelected} />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl border border-neutral-200/90 bg-neutral-50/40 shadow-2xs">
            <div>
              <div className="text-xs font-bold text-neutral-800">
                Only need a standalone digital signature image?
              </div>
              <div className="text-xs text-neutral-600 mt-0.5">
                Draw, type, or upload to download as a Transparent or White Background PNG.
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-brand-primary text-white text-xs font-semibold hover:bg-brand-primary-hover transition-colors cursor-pointer shadow-2xs shrink-0 min-h-[40px]"
            >
              <FaSignature className="w-3.5 h-3.5" />
              <span>Create & Download Signature PNG</span>
            </button>
          </div>
        </div>
      )}

      {hasFile && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-neutral-50/80 px-5 py-3.5 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-subtle text-brand-primary flex items-center justify-center shrink-0">
                <HiDocumentText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-neutral-900 truncate max-w-xs sm:max-w-md">
                  {fileName}
                </h3>
                <div className="flex items-center gap-2 text-xs text-neutral-600 mt-0.5">
                  <span>{formatFileSize(fileSize)}</span>
                  <span>•</span>
                  <span>{pageCount} {pageCount === 1 ? "page" : "pages"}</span>
                  <span>•</span>
                  <span className="text-brand-primary font-semibold">
                    {placements.length} {placements.length === 1 ? "stamp placed" : "stamps placed"}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer min-h-[36px] inline-flex items-center"
            >
              Choose different file
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 flex flex-col items-center">
              <PdfViewerToolbar
                activePage={activePage}
                pageCount={pageCount}
                pageInputStr={pageInputStr}
                zoomLevel={zoomLevel}
                onPageChange={(p) => void handlePageChange(p)}
                onPageInputSubmit={handlePageInputSubmit}
                onPageInputChange={setPageInputStr}
                onPageInputBlur={handlePageInputBlur}
                onZoomChange={setZoomLevel}
              />

              <div className="w-full overflow-auto flex justify-center items-start p-3 rounded-2xl border border-neutral-200/80 bg-neutral-100/50 shadow-inner max-h-[78vh]">
                <div
                  ref={previewContainerRef}
                  style={{
                    width: `${Math.round((700 * zoomLevel) / 100)}px`,
                    maxWidth: "100%",
                  }}
                  className="relative rounded-lg shadow-sm overflow-hidden bg-white border border-neutral-300 select-none transition-transform duration-75 shrink-0"
                >
                  {isLoadingThumb ? (
                    <div
                      className="w-full flex flex-col items-center justify-center bg-white gap-3"
                      style={{ aspectRatio }}
                    >
                      <HiArrowPath className="w-8 h-8 text-brand-primary animate-spin" />
                      <span className="text-xs font-semibold text-neutral-600">
                        Rendering Page {activePage}...
                      </span>
                    </div>
                  ) : previewThumb ? (
                    <div className="relative w-full" style={{ aspectRatio }}>
                      <Image
                        src={previewThumb}
                        alt={`Page ${activePage}`}
                        fill
                        unoptimized
                        className="object-contain pointer-events-none select-none block"
                        draggable={false}
                        onLoad={(e) => {
                          const { naturalWidth, naturalHeight } = e.currentTarget;
                          if (naturalWidth && naturalHeight) {
                            setAspectRatio(naturalWidth / naturalHeight);
                          }
                        }}
                      />

                      <SignaturePlacementOverlay
                        containerRef={previewContainerRef}
                        placements={placements}
                        activePageNumber={activePage}
                        selectedId={selectedPlacementId}
                        onSelectPlacement={setSelectedPlacementId}
                        onUpdatePlacement={updatePlacement}
                        onDeletePlacement={deletePlacement}
                      />
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2.5 text-xs text-neutral-600">
                <span>Tip: Click and drag any stamp to reposition. Drag the bottom-right corner to resize.</span>
              </div>
            </div>

            <SignaturesSidebar
              placements={placements}
              activePage={activePage}
              selectedPlacementId={selectedPlacementId}
              isProcessing={isProcessing}
              onOpenCreateModal={() => setIsModalOpen(true)}
              onAddDateStamp={handleAddDateStampClick}
              onSelectPlacement={(id, pageNum) => {
                void handlePageChange(pageNum);
                setSelectedPlacementId(id);
              }}
              onDeletePlacement={deletePlacement}
              onClearAllPlacements={() => setPlacements([])}
              onSignPdf={handleSignPdf}
            />
          </div>
        </div>
      )}

      {isModalOpen && (
        <SignaturePadModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveSignature}
        />
      )}
    </div>
  );
}
