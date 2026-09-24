"use client";

import { useState } from "react";
import Image from "next/image";
import {
  HiShieldCheck,
  HiArrowPath,
  HiOutlineDocumentText,
  HiIdentification,
  HiTrash,
  HiArrowDownTray,
  HiCheck,
  HiInformationCircle,
} from "react-icons/hi2";
import { toast } from "@/components/ui/sonner";
import { Combobox } from "@/components/ui/Combobox";
import { DropZone } from "./DropZone";
import { validatePdfFile } from "@/lib/pdf/validation";
import {
  extractPdfMetadata,
  updateMetadataAndDownload,
  sanitizeMetadataAndDownload,
  OFFICIAL_CREATOR_OPTIONS,
  OFFICIAL_PRODUCER_OPTIONS,
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
      toast.success("PDF downloaded with all metadata removed.");
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
      heading="Edit PDF Metadata"
      subheading="View, update, or remove document properties and metadata."
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
            {/* Left Column: Document Overview */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              {/* Document Preview Card */}
              <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-2xs flex flex-col items-center">
                <h3 className="text-sm font-semibold text-neutral-800 self-start mb-3">
                  Document Preview
                </h3>

                <div className="relative w-48 h-64 rounded-xl border border-neutral-200 bg-neutral-100 flex items-center justify-center overflow-hidden shadow-inner">
                  {isLoadingThumb ? (
                    <div className="flex flex-col items-center gap-2 text-neutral-500">
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
                    <div className="flex flex-col items-center gap-2 text-neutral-500">
                      <HiOutlineDocumentText className="w-10 h-10" />
                      <span className="text-xs">Page 1</span>
                    </div>
                  )}
                </div>

                <div className="w-full mt-4 pt-4 border-t border-neutral-100 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-neutral-600 block font-medium">Pages</span>
                    <span className="font-semibold text-neutral-800">{pageCount}</span>
                  </div>
                  <div>
                    <span className="text-neutral-600 block font-medium">Original Size</span>
                    <span className="font-semibold text-neutral-800">{originalMeta?.formattedSize}</span>
                  </div>
                  <div>
                    <span className="text-neutral-600 block font-medium">Created Date</span>
                    <span className="font-semibold text-neutral-800 truncate block">
                      {originalMeta?.creationDate ? originalMeta.creationDate.toLocaleDateString() : "Not set"}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-600 block font-medium">Modified Date</span>
                    <span className="font-semibold text-neutral-800 truncate block">
                      {originalMeta?.modificationDate ? originalMeta.modificationDate.toLocaleDateString() : "Not set"}
                    </span>
                  </div>
                </div>

                <div className="w-full mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                  <span className="text-neutral-600 font-medium">Metadata Status</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 font-medium">
                    {hasOriginalIdentifiers ? "Contains metadata" : "No metadata detected"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleDirectSanitize}
                  disabled={isSanitizing || isProcessing}
                  className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 min-h-[40px]"
                >
                  {isSanitizing ? (
                    <HiArrowPath className="w-4 h-4 animate-spin text-neutral-500" />
                  ) : (
                    <HiShieldCheck className="w-4 h-4 text-neutral-500" />
                  )}
                  <span>Strip Metadata & Download</span>
                </button>
              </div>
            </div>

            {/* Right Column: Metadata Form Fields */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-neutral-200 p-6 shadow-2xs flex flex-col gap-5">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <HiIdentification className="w-5 h-5 text-brand-primary" />
                  <h2 className="text-lg font-bold text-neutral-900">Document Properties</h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleApplySanitizePreset}
                    className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 min-h-[36px]"
                    title="Clear all fields"
                  >
                    <HiTrash className="w-3.5 h-3.5" />
                    <span>Clear All</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetToOriginal}
                    className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 min-h-[36px]"
                    title="Restore original properties"
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
                    placeholder="e.g. Annual Financial Report"
                    className="w-full text-xs sm:text-sm rounded-xl border border-neutral-200 px-3.5 py-2.5 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-[border-color,box-shadow] duration-150 ease-out"
                  />
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
                    placeholder="e.g. Acme Corp"
                    className="w-full text-xs sm:text-sm rounded-xl border border-neutral-200 px-3.5 py-2.5 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-[border-color,box-shadow] duration-150 ease-out"
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
                    placeholder="e.g. Summary of operations"
                    className="w-full text-xs sm:text-sm rounded-xl border border-neutral-200 px-3.5 py-2.5 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-[border-color,box-shadow] duration-150 ease-out"
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
                    placeholder="e.g. finance, quarterly, report (comma separated)"
                    className="w-full text-xs sm:text-sm rounded-xl border border-neutral-200 px-3.5 py-2.5 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-[border-color,box-shadow] duration-150 ease-out"
                  />
                </div>

                {/* Creator Software */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="meta-creator" className="text-xs font-bold text-neutral-700">
                    Creator Software
                  </label>
                  <Combobox
                    id="meta-creator"
                    value={form.creator}
                    onChange={(val) => setForm((prev) => ({ ...prev, creator: val }))}
                    placeholder="e.g. Microsoft® Word for Microsoft 365"
                    options={OFFICIAL_CREATOR_OPTIONS.map((item) => item.value)}
                  />
                </div>

                {/* Producer Engine */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="meta-producer" className="text-xs font-bold text-neutral-700">
                    PDF Producer
                  </label>
                  <Combobox
                    id="meta-producer"
                    value={form.producer}
                    onChange={(val) => setForm((prev) => ({ ...prev, producer: val }))}
                    placeholder="e.g. Adobe PDF Library 17.0"
                    options={OFFICIAL_PRODUCER_OPTIONS.map((item) => item.value)}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={handleUpdate}
                  disabled={isProcessing || isSanitizing}
                  className="w-full sm:flex-1 flex items-center justify-center gap-2 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-bold py-3.5 px-6 transition-colors shadow-sm cursor-pointer disabled:opacity-50 min-h-[44px]"
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
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 text-sm font-semibold py-3.5 px-5 transition-colors cursor-pointer disabled:opacity-50 min-h-[44px]"
                >
                  <HiArrowDownTray className="w-4 h-4 text-neutral-500" />
                  <span>Strip Metadata & Download</span>
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
