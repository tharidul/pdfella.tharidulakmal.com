"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import {
  HiDocumentText,
  HiArrowPath,
  HiChevronLeft,
  HiChevronRight,
  HiChevronDoubleLeft,
  HiChevronDoubleRight,
  HiPlus,
  HiCalendar,
  HiShieldCheck,
  HiMagnifyingGlassPlus,
  HiMagnifyingGlassMinus,
  HiArrowDownTray,
} from "react-icons/hi2";
import { FaSignature } from "react-icons/fa6";
import { toast } from "@/components/ui/sonner";
import { DropZone } from "./DropZone";
import { formatFileSize, validatePdfFile } from "@/lib/pdf/validation";
import { extractPdfMetadata } from "@/lib/pdf/metadata";
import { renderPageThumbnail, releasePdfDocument } from "@/lib/pdf/render";
import {
  signAndDownloadPdf,
  downloadSignatureImage,
  type SignaturePlacement,
} from "@/lib/pdf/sign";
import { SignaturePadModal } from "./SignaturePadModal";
import { SignaturePlacementOverlay } from "./SignaturePlacementOverlay";

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

  // Placements state
  const [placements, setPlacements] = useState<SignaturePlacement[]>([]);
  const [selectedPlacementId, setSelectedPlacementId] = useState<string | null>(null);

  // Sidebar download popover state
  const [sidebarDownloadMenuId, setSidebarDownloadMenuId] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);

  // Container ref for relative coordinate mapping
  const previewContainerRef = useRef<HTMLDivElement | null>(null);

  // Close sidebar download menu on outside click
  useEffect(() => {
    const handleCloseSidebarMenu = () => setSidebarDownloadMenuId(null);
    window.addEventListener("click", handleCloseSidebarMenu);
    return () => window.removeEventListener("click", handleCloseSidebarMenu);
  }, []);

  // Switch active page and render its thumbnail
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
      if (clamped !== activePage) {
        void handlePageChange(clamped);
      } else {
        setPageInputStr(String(activePage));
      }
    } else {
      setPageInputStr(String(activePage));
    }
  };

  const handleFilesSelected = async (files: FileList) => {
    const file = files[0];
    if (!file) return;

    setPlacements([]);
    setSelectedPlacementId(null);

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
    setPlacements([]);
    setSelectedPlacementId(null);
    setZoomLevel(100);
  };

  // Add signature from modal with natural aspect ratio
  const handleSaveSignature = (dataUrl: string, label: string) => {
    if (!hasFile) {
      downloadSignatureImage(dataUrl, "transparent", label || "signature");
      toast.success(
        "Signature downloaded as Transparent PNG! Upload a PDF to place and stamp it onto document pages."
      );
      return;
    }

    const img = new window.Image();
    img.onload = () => {
      const naturalW = img.naturalWidth || 300;
      const naturalH = img.naturalHeight || 100;
      const imageAspect = naturalW / naturalH;

      const container = previewContainerRef.current;
      const pageAspect = container
        ? container.clientWidth / (container.clientHeight || 1)
        : 0.707;

      const widthPercent = 28;
      const heightPercent = Math.max(3, (widthPercent * pageAspect) / imageAspect);

      const newPlacement: SignaturePlacement = {
        id: `sig-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        pageNumber: activePage,
        xPercent: 35,
        yPercent: Math.min(85, 70),
        widthPercent,
        heightPercent,
        imageDataUrl: dataUrl,
        aspectRatio: imageAspect,
        label,
      };

      setPlacements((prev) => [...prev, newPlacement]);
      setSelectedPlacementId(newPlacement.id);
    };
    img.src = dataUrl;
  };

  // Add quick date stamp with locked aspect ratio
  const handleAddDateStamp = () => {
    const offscreen = document.createElement("canvas");
    offscreen.width = 440;
    offscreen.height = 80;
    const ctx = offscreen.getContext("2d");
    if (!ctx) return;

    const formattedDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    ctx.font = "bold 32px Inter, system-ui, sans-serif";
    ctx.fillStyle = "#1e293b";
    ctx.textBaseline = "middle";
    ctx.fillText(`Date: ${formattedDate}`, 10, 40);

    const dataUrl = offscreen.toDataURL("image/png");
    const imageAspect = 440 / 80;

    const container = previewContainerRef.current;
    const pageAspect = container
      ? container.clientWidth / (container.clientHeight || 1)
      : 0.707;

    const widthPercent = 22;
    const heightPercent = Math.max(2.5, (widthPercent * pageAspect) / imageAspect);

    const newPlacement: SignaturePlacement = {
      id: `date-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      pageNumber: activePage,
      xPercent: 55,
      yPercent: 75,
      widthPercent,
      heightPercent,
      imageDataUrl: dataUrl,
      aspectRatio: imageAspect,
      label: `Date (${formattedDate})`,
    };

    setPlacements((prev) => [...prev, newPlacement]);
    setSelectedPlacementId(newPlacement.id);
  };

  // Update placement coordinates
  const handleUpdatePlacement = (
    id: string,
    updates: Partial<Pick<SignaturePlacement, "xPercent" | "yPercent" | "widthPercent" | "heightPercent">>
  ) => {
    setPlacements((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  // Delete placement
  const handleDeletePlacement = (id: string) => {
    setPlacements((prev) => prev.filter((p) => p.id !== id));
    if (selectedPlacementId === id) {
      setSelectedPlacementId(null);
    }
  };

  // Execute signing
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

  const activePagePlacements = placements.filter((p) => p.pageNumber === activePage);

  return (
    <main
      className={
        hasFile
          ? "w-full max-w-6xl mx-auto px-4 py-6 flex flex-col"
          : "w-full max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-8 flex flex-col"
      }
    >
      {/* Header Section */}
      {!hasFile && (
        <div className="flex flex-col mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight mb-1.5">
            Sign PDF document
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            Draw, type, or upload your signature and place it on any page. 100% private in your browser.
          </p>
        </div>
      )}

      {/* When no file is selected */}
      {!hasFile && (
        <div className="flex flex-col">
          <DropZone onFilesSelected={handleFilesSelected} />



          {/* Quick Standalone Signature Generator Banner */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl border border-neutral-200/90 bg-neutral-50/40 shadow-2xs">
            <div>
              <div className="text-xs font-bold text-neutral-800">
                Only need a standalone digital signature image?
              </div>
              <div className="text-[11px] text-neutral-500 mt-0.5">
                Draw, type, or upload to download as a Transparent or White Background PNG.
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-brand-primary text-white text-xs font-semibold hover:bg-brand-primary-hover transition-colors cursor-pointer shadow-2xs shrink-0"
            >
              <FaSignature className="w-3.5 h-3.5" />
              <span>Create & Download Signature PNG</span>
            </button>
          </div>
        </div>
      )}

      {/* When file is loaded */}
      {hasFile && (
        <div className="space-y-6">
          {/* File Meta Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-neutral-50/80 px-5 py-3.5 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-subtle text-brand-primary flex items-center justify-center shrink-0">
                <HiDocumentText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-neutral-900 truncate max-w-xs sm:max-w-md">
                  {fileName}
                </h3>
                <div className="flex items-center gap-2 text-[11px] text-neutral-500 mt-0.5">
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
              className="text-xs font-bold text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
            >
              Choose different file
            </button>
          </div>



          {/* Main Signing Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left/Center Column: PDF Document Viewer & Navigation Bar */}
            <div className="lg:col-span-8 flex flex-col items-center">
              {/* Comprehensive Page Search & Navigation Toolbar */}
              <div className="flex flex-wrap items-center justify-between w-full rounded-xl border border-neutral-200 bg-white p-2.5 shadow-2xs mb-3 gap-3">
                {/* Page Navigation & Direct Search Jump */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => void handlePageChange(1)}
                    disabled={activePage <= 1}
                    title="First Page"
                    className="p-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <HiChevronDoubleLeft className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => void handlePageChange(activePage - 1)}
                    disabled={activePage <= 1}
                    title="Previous Page"
                    className="p-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <HiChevronLeft className="w-3.5 h-3.5" />
                  </button>

                  {/* Interactive Page Search / Number Input Form */}
                  <form onSubmit={handlePageInputSubmit} className="flex items-center gap-1.5 px-1">
                    <span className="text-xs text-neutral-500 font-medium">Page</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={pageInputStr}
                      onChange={(e) => setPageInputStr(e.target.value)}
                      onBlur={handlePageInputBlur}
                      title="Type page number and press Enter"
                      className="w-12 text-center rounded-lg border border-neutral-300 py-1 text-xs font-bold text-neutral-800 shadow-2xs focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:outline-none"
                    />
                    <span className="text-xs text-neutral-500 font-medium">of {pageCount}</span>
                  </form>

                  <button
                    type="button"
                    onClick={() => void handlePageChange(activePage + 1)}
                    disabled={activePage >= pageCount}
                    title="Next Page"
                    className="p-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <HiChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => void handlePageChange(pageCount)}
                    disabled={activePage >= pageCount}
                    title="Last Page"
                    className="p-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <HiChevronDoubleRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Right: Zoom Level Controls */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-neutral-500 font-medium hidden sm:inline">Zoom:</span>
                  <button
                    type="button"
                    onClick={() => setZoomLevel((z) => Math.max(75, z - 15))}
                    disabled={zoomLevel <= 75}
                    title="Zoom Out"
                    className="p-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <HiMagnifyingGlassMinus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomLevel(100)}
                    title="Reset Zoom"
                    className="px-2 py-1 text-[11px] font-bold rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100 cursor-pointer"
                  >
                    {zoomLevel}%
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomLevel((z) => Math.min(160, z + 15))}
                    disabled={zoomLevel >= 160}
                    title="Zoom In"
                    className="p-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <HiMagnifyingGlassPlus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Scrollable Page Viewport */}
              <div className="w-full flex justify-center overflow-auto max-h-[78vh] p-2 rounded-2xl border border-neutral-300 bg-neutral-200/60 shadow-inner">
                <div
                  style={{ width: `${Math.round(560 * (zoomLevel / 100))}px` }}
                  className="relative transition-all duration-150 shrink-0"
                >
                  <div
                    ref={previewContainerRef}
                    className="relative w-full aspect-[1/1.39] overflow-hidden rounded-xl bg-white shadow-xl border border-neutral-200"
                  >
                    {isLoadingThumb && (
                      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80 backdrop-blur-xs gap-2">
                        <HiArrowPath className="w-8 h-8 text-brand-primary animate-spin" />
                        <span className="text-xs font-semibold text-neutral-600">
                          Rendering Page {activePage}...
                        </span>
                      </div>
                    )}

                    {previewThumb ? (
                      <>
                        <Image
                          src={previewThumb}
                          alt={`Document Page ${activePage}`}
                          fill
                          unoptimized
                          priority
                          className="object-contain pointer-events-none"
                        />

                        {/* Interactive Signature Placement Overlay */}
                        <SignaturePlacementOverlay
                          containerRef={previewContainerRef}
                          placements={placements}
                          activePageNumber={activePage}
                          selectedId={selectedPlacementId}
                          onSelectPlacement={setSelectedPlacementId}
                          onUpdatePlacement={handleUpdatePlacement}
                          onDeletePlacement={handleDeletePlacement}
                        />
                      </>
                    ) : (
                      <div className="flex h-96 w-full items-center justify-center text-xs text-neutral-500">
                        Loading page preview...
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between w-full max-w-lg mt-2.5 px-2 text-[11px] text-neutral-500">
                <span>Drag to position • Corner handle to resize</span>
                {activePagePlacements.length > 0 && (
                  <span className="font-semibold text-brand-primary">
                    {activePagePlacements.length} stamp(s) on Page {activePage}
                  </span>
                )}
              </div>
            </div>

            {/* Right Column: Signing Tools & Actions (Unified Single Card, Sticky) */}
            <div className="lg:col-span-4 lg:sticky lg:top-6 self-start">
              <div className="rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-xs flex flex-col gap-5">
                {/* 1. Add Signature & Stamps */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Add Signature & Stamps
                  </h3>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(true)}
                      className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-brand-primary px-4 py-3 text-xs font-bold text-white shadow-xs hover:bg-brand-primary-hover transition-all cursor-pointer hover:shadow-sm"
                    >
                      <FaSignature className="w-4 h-4" />
                      <span>Create New Signature</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleAddDateStamp}
                      className="w-full flex items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-xs font-bold text-neutral-800 hover:bg-neutral-50 transition-colors cursor-pointer"
                    >
                      <HiCalendar className="w-4 h-4 text-neutral-600" />
                      <span>Add Date Stamp</span>
                    </button>
                  </div>
                </div>

                <hr className="border-neutral-100" />

                {/* 2. Placed Elements List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                      Placed Elements ({placements.length})
                    </h3>
                    {placements.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setPlacements([])}
                        className="text-[11px] font-bold text-brand-primary hover:text-brand-primary-hover hover:underline cursor-pointer"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  {placements.length === 0 ? (
                    <div className="text-center py-4 text-xs text-neutral-400 border border-neutral-100 rounded-xl bg-neutral-50/60">
                      No signatures placed yet. Click above to add a signature.
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                      {placements.map((p, idx) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            void handlePageChange(p.pageNumber);
                            setSelectedPlacementId(p.id);
                          }}
                          className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                            selectedPlacementId === p.id
                              ? "border-neutral-300 bg-neutral-100/70 shadow-2xs"
                              : "border-neutral-200 hover:border-neutral-300 bg-white"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                selectedPlacementId === p.id
                                  ? "bg-brand-primary text-white"
                                  : "bg-neutral-100 text-neutral-600"
                              }`}
                            >
                              {idx + 1}
                            </span>
                            <div className="truncate">
                              <span className="font-semibold text-neutral-800 block truncate">
                                {p.label ?? "Signature"}
                              </span>
                              <span className="text-[10px] text-neutral-500">
                                Page {p.pageNumber} {p.pageNumber === activePage ? "(Current)" : ""}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-0.5 relative">
                            {/* Format Selection Popover Toggle */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSidebarDownloadMenuId((prev) => (prev === p.id ? null : p.id));
                              }}
                              className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-md hover:bg-neutral-200/50 transition-colors cursor-pointer"
                              title="Download signature (Transparent or White BG)"
                            >
                              <HiArrowDownTray className="w-3.5 h-3.5" />
                            </button>

                            {/* Sidebar Popover Menu */}
                            {sidebarDownloadMenuId === p.id && (
                              <div
                                className="absolute right-0 bottom-full mb-1 w-48 rounded-xl bg-white border border-neutral-200 shadow-xl p-1.5 z-30 animate-in fade-in zoom-in-95 duration-100"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-100 mb-1">
                                  Download Format
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    downloadSignatureImage(
                                      p.imageDataUrl,
                                      "transparent",
                                      p.label ?? "signature"
                                    );
                                    setSidebarDownloadMenuId(null);
                                  }}
                                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-neutral-800 hover:bg-brand-subtle hover:text-brand-primary flex items-center justify-between cursor-pointer transition-colors"
                                >
                                  <span>Transparent PNG</span>
                                  <span className="text-[9px] text-neutral-500 bg-neutral-100 px-1 py-0.5 rounded font-medium">Clear</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    downloadSignatureImage(
                                      p.imageDataUrl,
                                      "white",
                                      p.label ?? "signature"
                                    );
                                    setSidebarDownloadMenuId(null);
                                  }}
                                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-neutral-800 hover:bg-brand-subtle hover:text-brand-primary flex items-center justify-between cursor-pointer transition-colors"
                                >
                                  <span>White BG PNG</span>
                                  <span className="text-[9px] text-neutral-500 bg-neutral-100 px-1 py-0.5 rounded font-medium">Solid</span>
                                </button>
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePlacement(p.id);
                              }}
                              className="text-neutral-400 hover:text-brand-primary p-1.5 transition-colors cursor-pointer"
                              title="Delete stamp"
                            >
                              <HiPlus className="w-4 h-4 rotate-45" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <hr className="border-neutral-100" />

                {/* 3. Sign & Download Action */}
                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={handleSignPdf}
                    disabled={placements.length === 0 || isProcessing}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-primary py-3.5 px-4 text-sm font-bold text-white shadow-sm hover:bg-brand-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer hover:shadow"
                  >
                    {isProcessing ? (
                      <>
                        <HiArrowPath className="w-4 h-4 animate-spin" />
                        <span>Embedding Signatures...</span>
                      </>
                    ) : (
                      <>
                        <HiShieldCheck className="w-5 h-5" />
                        <span>Sign & Download PDF</span>
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-neutral-400 text-center leading-relaxed">
                    All embedding executes locally on your device. Zero server uploads.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Signature Creation Modal */}
      {isModalOpen && (
        <SignaturePadModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveSignature}
        />
      )}
    </main>
  );
}
