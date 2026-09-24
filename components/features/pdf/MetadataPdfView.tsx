"use client";

import { useState } from "react";
import Image from "next/image";
import {
  HiShieldCheck,
  HiArrowPath,
  HiOutlineDocumentText,
  HiIdentification,
  HiSparkles,
  HiArrowDownTray,
  HiCheck,
  HiInformationCircle,
} from "react-icons/hi2";
import { toast } from "@/components/ui/sonner";
import { DropZone } from "./DropZone";
import { validatePdfFile } from "@/lib/pdf/validation";
import {
  extractPdfMetadata,
  updateMetadataAndDownload,
  sanitizeMetadataAndDownload,
  type PdfDocumentMetadata,
  type UpdatePdfMetadataOptions,
} from "@/lib/pdf";
import { renderPageThumbnail, releasePdfDocument } from "@/lib/pdf/render";
import { PdfToolLayout, PdfFileHeader, PrivacyFooter } from "./shared";

interface FormFields {
  title: string;
  author: string;
  subject: string;
  keywords: string;
  creator: string;
  producer: string;
}

export function MetadataPdfView() {
  const [hasFile, setHasFile] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [previewThumb, setPreviewThumb] = useState<string | null>(null);
  const [isLoadingThumb, setIsLoadingThumb] = useState(false);

  const [originalMeta, setOriginalMeta] = useState<PdfDocumentMetadata | null>(null);
  const [form, setForm] = useState<FormFields>({
    title: "",
    author: "",
    subject: "",
    keywords: "",
    creator: "",
    producer: "",
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSanitizing, setIsSanitizing] = useState(false);

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
      const meta = await extractPdfMetadata(buffer, file.name);

      setFileName(file.name);
      setFileSize(buffer.byteLength);
      setPageCount(meta.pageCount);
      setFileBuffer(buffer);
      setOriginalMeta(meta);

      setForm({
        title: meta.title ?? "",
        author: meta.author ?? "",
        subject: meta.subject ?? "",
        keywords: meta.keywords ?? "",
        creator: meta.creator ?? "",
        producer: meta.producer ?? "",
      });

      setHasFile(true);

      // Render thumbnail of first page for preview
      setIsLoadingThumb(true);
      try {
        const thumb = await renderPageThumbnail(buffer, 1, {
          width: 320,
          height: 440,
          quality: 0.9,
        });
        setPreviewThumb(thumb);
      } catch {
        // Thumbnail failure is non-fatal
        setPreviewThumb(null);
      } finally {
        setIsLoadingThumb(false);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to read PDF document.";
      toast.error(msg);
    }
  };

  const handleResetToOriginal = () => {
    if (!originalMeta) return;
    setForm({
      title: originalMeta.title ?? "",
      author: originalMeta.author ?? "",
      subject: originalMeta.subject ?? "",
      keywords: originalMeta.keywords ?? "",
      creator: originalMeta.creator ?? "",
      producer: originalMeta.producer ?? "",
    });
    toast.info("Metadata reset to original document values.");
  };

  const handleApplySanitizePreset = () => {
    setForm({
      title: "",
      author: "",
      subject: "",
      keywords: "",
      creator: "",
      producer: "",
    });
    toast.success("All metadata fields cleared. Click 'Save & Download' or 'Sanitize Now'.");
  };

  const handleUpdate = async () => {
    if (!fileBuffer || isProcessing) return;

    setIsProcessing(true);
    try {
      const options: UpdatePdfMetadataOptions = {
        title: form.title,
        author: form.author,
        subject: form.subject,
        keywords: form.keywords,
        creator: form.creator,
        producer: form.producer,
      };

      await updateMetadataAndDownload(fileBuffer, fileName, options);
      toast.success("Updated PDF downloaded successfully!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update PDF metadata.";
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDirectSanitize = async () => {
    if (!fileBuffer || isSanitizing) return;

    setIsSanitizing(true);
    try {
      await sanitizeMetadataAndDownload(fileBuffer, fileName);
      toast.success("100% sanitized PDF downloaded! All tracking metadata removed.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to sanitize PDF metadata.";
      toast.error(msg);
    } finally {
      setIsSanitizing(false);
    }
  };

  const resetAll = () => {
    if (fileBuffer) {
      void releasePdfDocument(fileBuffer);
    }
    setHasFile(false);
    setFileName("");
    setFileSize(0);
    setPageCount(0);
    setFileBuffer(null);
    setPreviewThumb(null);
    setOriginalMeta(null);
    setForm({
      title: "",
      author: "",
      subject: "",
      keywords: "",
      creator: "",
      producer: "",
    });
  };

  // Determine if original file had identifying tracking metadata
  const hasOriginalIdentifiers = Boolean(
    originalMeta?.author ||
    originalMeta?.creator ||
    originalMeta?.producer ||
    originalMeta?.keywords ||
    originalMeta?.title
  );

  return (
    <PdfToolLayout
      hasFile={hasFile}
      heading="Edit PDF Metadata & Privacy Cleaner"
      subheading="View, modify document properties, or sanitize sensitive author and software tracking tags with 100% browser-based privacy."
    >
      {!hasFile ? (
        <DropZone onFilesSelected={handleFilesSelected} />
      ) : (
        <div className="space-y-6">
          <PdfFileHeader
            fileName={fileName}
            fileSize={fileSize}
            pageCount={pageCount}
            onReset={resetAll}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Document Overview & Privacy Status */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              {/* Document Preview Card */}
              <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-2xs flex flex-col items-center">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider self-start mb-3">
                  Document Preview
                </span>

                <div className="relative w-48 h-64 rounded-xl border border-neutral-200 bg-neutral-100 flex items-center justify-center overflow-hidden shadow-inner">
                  {isLoadingThumb ? (
                    <div className="flex flex-col items-center gap-2 text-neutral-400">
                      <HiArrowPath className="w-6 h-6 animate-spin text-brand-primary" />
                      <span className="text-xs">Generating preview...</span>
                    </div>
                  ) : previewThumb ? (
                    <Image
                      src={previewThumb}
                      alt="PDF Page Preview"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-neutral-400">
                      <HiOutlineDocumentText className="w-10 h-10" />
                      <span className="text-xs">Page 1</span>
                    </div>
                  )}
                </div>

                <div className="w-full mt-4 pt-4 border-t border-neutral-100 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-neutral-400 block font-medium">Pages</span>
                    <span className="font-semibold text-neutral-800">{pageCount}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block font-medium">Original Size</span>
                    <span className="font-semibold text-neutral-800">{originalMeta?.formattedSize}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block font-medium">Created Date</span>
                    <span className="font-semibold text-neutral-800 truncate block">
                      {originalMeta?.creationDate ? originalMeta.creationDate.toLocaleDateString() : "Not set"}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block font-medium">Modified Date</span>
                    <span className="font-semibold text-neutral-800 truncate block">
                      {originalMeta?.modificationDate ? originalMeta.modificationDate.toLocaleDateString() : "Not set"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Privacy Analysis Card */}
              <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-2xs flex flex-col gap-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      hasOriginalIdentifiers
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    <HiShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900">Privacy & Metadata Check</h3>
                    <span className="text-xs text-neutral-500">
                      {hasOriginalIdentifiers
                        ? "Original document contains identifiable metadata"
                        : "No tracking metadata detected"}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-neutral-600 leading-relaxed bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                  PDF documents often embed personal identifiers like your name, device username, author profile, and the exact software/printer used to generate the file.
                </p>

                <div className="flex flex-col gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleDirectSanitize}
                    disabled={isSanitizing || isProcessing}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
                  >
                    {isSanitizing ? (
                      <HiArrowPath className="w-4 h-4 animate-spin" />
                    ) : (
                      <HiShieldCheck className="w-4 h-4" />
                    )}
                    <span>One-Click Sanitize & Download</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Metadata Form Fields */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-neutral-200 p-6 shadow-2xs flex flex-col gap-5">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <HiIdentification className="w-5 h-5 text-brand-primary" />
                  <h2 className="text-base font-bold text-neutral-900">Document Properties</h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleApplySanitizePreset}
                    className="text-xs font-semibold text-rose-600 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                    title="Clear all fields to strip metadata"
                  >
                    <HiSparkles className="w-3.5 h-3.5" />
                    <span>Clear All</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetToOriginal}
                    className="text-xs font-semibold text-neutral-600 hover:bg-neutral-100 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                    title="Restore original file properties"
                  >
                    <HiArrowPath className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              {/* Form Input Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Title */}
                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label htmlFor="meta-title" className="text-xs font-bold text-neutral-700">
                    Document Title
                  </label>
                  <input
                    id="meta-title"
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Annual Financial Report 2026"
                    className="w-full text-xs sm:text-sm rounded-xl border border-neutral-200 px-3.5 py-2.5 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                  />
                  <span className="text-[11px] text-neutral-400">
                    Displayed in PDF reader window headers and search engines.
                  </span>
                </div>

                {/* Author */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="meta-author" className="text-xs font-bold text-neutral-700">
                    Author / Organization
                  </label>
                  <input
                    id="meta-author"
                    type="text"
                    value={form.author}
                    onChange={(e) => setForm((prev) => ({ ...prev, author: e.target.value }))}
                    placeholder="e.g. John Doe / Acme Corp"
                    className="w-full text-xs sm:text-sm rounded-xl border border-neutral-200 px-3.5 py-2.5 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                  />
                </div>

                {/* Subject */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="meta-subject" className="text-xs font-bold text-neutral-700">
                    Subject / Description
                  </label>
                  <input
                    id="meta-subject"
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
                    placeholder="e.g. Q4 Executive Summary"
                    className="w-full text-xs sm:text-sm rounded-xl border border-neutral-200 px-3.5 py-2.5 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                  />
                </div>

                {/* Keywords */}
                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label htmlFor="meta-keywords" className="text-xs font-bold text-neutral-700">
                    Keywords / Tags
                  </label>
                  <input
                    id="meta-keywords"
                    type="text"
                    value={form.keywords}
                    onChange={(e) => setForm((prev) => ({ ...prev, keywords: e.target.value }))}
                    placeholder="e.g. finance, quarterly, report, 2026 (comma separated)"
                    className="w-full text-xs sm:text-sm rounded-xl border border-neutral-200 px-3.5 py-2.5 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                  />
                  <span className="text-[11px] text-neutral-400">
                    Helps index and categorize document in archiving systems.
                  </span>
                </div>

                {/* Creator Application */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="meta-creator" className="text-xs font-bold text-neutral-700 flex items-center gap-1">
                    <span>Creator Software</span>
                    <span title="The original program that authored the document" className="cursor-help text-neutral-400">
                      <HiInformationCircle className="w-3.5 h-3.5" />
                    </span>
                  </label>
                  <input
                    id="meta-creator"
                    type="text"
                    value={form.creator}
                    onChange={(e) => setForm((prev) => ({ ...prev, creator: e.target.value }))}
                    placeholder="e.g. Microsoft Word / InDesign"
                    className="w-full text-xs sm:text-sm rounded-xl border border-neutral-200 px-3.5 py-2.5 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                  />
                </div>

                {/* Producer Engine */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="meta-producer" className="text-xs font-bold text-neutral-700 flex items-center gap-1">
                    <span>PDF Producer</span>
                    <span title="The conversion tool or PDF library" className="cursor-help text-neutral-400">
                      <HiInformationCircle className="w-3.5 h-3.5" />
                    </span>
                  </label>
                  <input
                    id="meta-producer"
                    type="text"
                    value={form.producer}
                    onChange={(e) => setForm((prev) => ({ ...prev, producer: e.target.value }))}
                    placeholder="e.g. Acrobat Distiller"
                    className="w-full text-xs sm:text-sm rounded-xl border border-neutral-200 px-3.5 py-2.5 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={handleUpdate}
                  disabled={isProcessing || isSanitizing}
                  className="w-full sm:flex-1 flex items-center justify-center gap-2 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-bold py-3.5 px-6 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <HiArrowPath className="w-4 h-4 animate-spin" />
                      <span>Saving PDF...</span>
                    </>
                  ) : (
                    <>
                      <HiCheck className="w-4 h-4" />
                      <span>Save & Download PDF</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDirectSanitize}
                  disabled={isProcessing || isSanitizing}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 text-sm font-semibold py-3.5 px-5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <HiArrowDownTray className="w-4 h-4 text-neutral-500" />
                  <span>Sanitize & Download</span>
                </button>
              </div>
            </div>
          </div>

          <PrivacyFooter />
        </div>
      )}
    </PdfToolLayout>
  );
}
