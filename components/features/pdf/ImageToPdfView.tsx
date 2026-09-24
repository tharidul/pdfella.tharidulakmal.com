"use client";

import { useState, useRef, type ChangeEvent } from "react";
import Image from "next/image";
import {
  HiPlus,
  HiTrash,
  HiArrowUp,
  HiArrowDown,
  HiArrowRight,
  HiArrowPath,
} from "react-icons/hi2";
import {
  convertImagesAndDownload,
  type ImageItem,
  type ImagePageSize,
  type ImageOrientation,
  type ImageMargin,
} from "@/lib/pdf/imageToPdf";
import { MAX_PDF_FILE_SIZE_BYTES, formatFileSize } from "@/lib/pdf/validation";
import { DropZone } from "./DropZone";
import { Select } from "@/components/ui/Select";
import { toast } from "@/components/ui/sonner";

const PAGE_SIZE_OPTIONS = [
  { value: "a4", label: "A4 (Standard 210 × 297 mm)" },
  { value: "letter", label: "US Letter (8.5 × 11 in)" },
  { value: "fit", label: "Fit to Image (Original Size)" },
] as const;

const ORIENTATION_OPTIONS = [
  { value: "auto", label: "Auto (Match Image Ratio)" },
  { value: "portrait", label: "Portrait" },
  { value: "landscape", label: "Landscape" },
] as const;

const MARGIN_OPTIONS = [
  { value: "none", label: "No Margin (Full Bleed)" },
  { value: "small", label: "Small Margin (20pt)" },
  { value: "large", label: "Large Margin (40pt)" },
] as const;

export function ImageToPdfView() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [pageSize, setPageSize] = useState<ImagePageSize>("a4");
  const [orientation, setOrientation] = useState<ImageOrientation>("auto");
  const [margin, setMargin] = useState<ImageMargin>("none");
  const [isConverting, setIsConverting] = useState(false);
  const [progressMsg, setProgressMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectFiles = () => {
    fileInputRef.current?.click();
  };

  const handleFilesAdded = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    processIncomingFiles(Array.from(event.target.files));
    event.target.value = "";
  };

  const processIncomingFiles = (files: File[]) => {
    const validImages = files.filter((f) =>
      ["image/jpeg", "image/png", "image/webp", "image/bmp"].includes(f.type) ||
      /\.(jpe?g|png|webp|bmp)$/i.test(f.name)
    );

    if (validImages.length === 0) {
      toast.error("Please select valid image files (JPG, PNG, WebP, or BMP).");
      return;
    }

    const oversized = validImages.find((f) => f.size > MAX_PDF_FILE_SIZE_BYTES);
    if (oversized) {
      toast.error(`Image "${oversized.name}" (${formatFileSize(oversized.size)}) exceeds the maximum allowed limit of 200 MB.`);
      return;
    }

    const newItems: ImageItem[] = validImages.map((file) => ({
      id: `${file.name}-${file.size}-${Math.random()}`,
      file,
      name: file.name,
      size: file.size,
      previewUrl: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newItems]);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1]!;
      copy[index - 1] = copy[index]!;
      copy[index] = temp;
      return copy;
    });
  };

  const handleMoveDown = (index: number) => {
    setImages((prev) => {
      if (index >= prev.length - 1) return prev;
      const copy = [...prev];
      const temp = copy[index + 1]!;
      copy[index + 1] = copy[index]!;
      copy[index] = temp;
      return copy;
    });
  };

  const handleDelete = (id: string) => {
    setImages((prev) => {
      const filtered = prev.filter((item) => item.id !== id);
      const target = prev.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return filtered;
    });
  };

  const handleClearAll = () => {
    images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    setImages([]);
  };

  const handleConvert = async () => {
    if (images.length === 0 || isConverting) return;

    setIsConverting(true);

    try {
      await convertImagesAndDownload(
        images.map((img) => img.file),
        {
          pageSize,
          orientation,
          margin,
          onProgress: (cur, tot) => {
            setProgressMsg(`Processing image ${cur} of ${tot}...`);
          },
        }
      );

      toast.success(
        `Successfully converted ${images.length} ${
          images.length === 1 ? "image" : "images"
        } into a PDF document!`
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to convert images to PDF.";
      toast.error(msg);
    } finally {
      setIsConverting(false);
      setProgressMsg(null);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <main
      className={
        images.length > 0
          ? "w-full max-w-6xl mx-auto px-4 py-6 flex flex-col"
          : "w-full max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-8 flex flex-col"
      }
    >
      <div className="flex flex-col mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight mb-1.5">
          Convert images to PDF
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500">
          Upload JPG, PNG, or WebP images and compile them into a PDF document.
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/bmp"
        className="hidden"
        onChange={handleFilesAdded}
      />

      {images.length === 0 ? (
        <DropZone
          accept="image/jpeg,image/png,image/webp,image/bmp"
          title="Drop images here"
          subtitle="Supports JPG, PNG, WebP, and BMP. You can select multiple files up to 200 MB."
          onFilesSelected={(files) => {
            processIncomingFiles(Array.from(files));
          }}
        />
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-neutral-50/80 px-5 py-3.5 shadow-2xs">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSelectFiles}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-neutral-200 text-neutral-700 bg-white hover:bg-neutral-50 text-xs font-semibold transition-colors cursor-pointer"
              >
                <HiPlus className="w-4 h-4 text-brand-primary" />
                <span>Add More Images</span>
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-neutral-500 hover:text-brand-primary hover:bg-brand-subtle text-xs font-semibold transition-colors cursor-pointer"
              >
                <HiTrash className="w-4 h-4" />
                <span>Clear All</span>
              </button>
            </div>

            <span className="text-xs font-bold text-neutral-800">
              {images.length} {images.length === 1 ? "image" : "images"} selected
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 border border-neutral-200 rounded-2xl bg-white p-4 sm:p-5 shadow-2xs">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-100">
                <span className="text-xs font-semibold text-neutral-800">
                  Images sequence ({images.length})
                </span>
                <span className="text-xs text-neutral-500">
                  Use arrows to reorder pages
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 max-h-[75vh] overflow-y-auto pr-1">
                {images.map((item, index) => (
                  <div
                    key={item.id}
                    className="relative bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
                  >
                    <div className="relative w-full aspect-4/3 bg-neutral-50 flex items-center justify-center overflow-hidden border-b border-neutral-100">
                      <Image
                        src={item.previewUrl}
                        alt={item.name}
                        fill
                        unoptimized
                        className="object-contain p-2"
                      />
                      <span className="absolute top-2 left-2 bg-neutral-900/75 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                        {index + 1}
                      </span>
                    </div>

                    <div className="p-2.5 flex flex-col justify-between">
                      <div className="mb-2">
                        <p className="text-xs font-bold text-neutral-800 truncate" title={item.name}>
                          {item.name}
                        </p>
                        <span className="text-[10px] text-neutral-400">
                          {formatSize(item.size)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMoveUp(index)}
                            disabled={index === 0}
                            title="Move Left/Up"
                            className="w-6 h-6 rounded flex items-center justify-center text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                          >
                            <HiArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveDown(index)}
                            disabled={index === images.length - 1}
                            title="Move Right/Down"
                            className="w-6 h-6 rounded flex items-center justify-center text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                          >
                            <HiArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          title="Remove image"
                          className="w-6 h-6 rounded flex items-center justify-center text-neutral-400 hover:text-brand-primary hover:bg-brand-subtle cursor-pointer transition-colors"
                        >
                          <HiTrash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4 lg:sticky lg:top-6 self-start">
              <div className="rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-xs flex flex-col gap-5">
                <div className="space-y-4">
                  <span className="text-xs font-semibold text-neutral-700 block">
                    Page configuration
                  </span>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-700 block">Page Size</label>
                    <Select
                      value={pageSize}
                      onChange={(val) => setPageSize(val as ImagePageSize)}
                      options={PAGE_SIZE_OPTIONS}
                      triggerClassName="py-2.5 px-3.5 text-xs rounded-xl border border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50 text-neutral-800"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-700 block">Orientation</label>
                    <Select
                      value={orientation}
                      disabled={pageSize === "fit"}
                      onChange={(val) => setOrientation(val as ImageOrientation)}
                      options={ORIENTATION_OPTIONS}
                      triggerClassName="py-2.5 px-3.5 text-xs rounded-xl border border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50 text-neutral-800"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-700 block">Page Margins</label>
                    <Select
                      value={margin}
                      onChange={(val) => setMargin(val as ImageMargin)}
                      options={MARGIN_OPTIONS}
                      triggerClassName="py-2.5 px-3.5 text-xs rounded-xl border border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50 text-neutral-800"
                    />
                  </div>
                </div>

                <hr className="border-neutral-100" />

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-neutral-700 block">
                    Document summary
                  </span>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-500">Output document:</span>
                    <span className="font-bold text-brand-primary">
                      {images.length} {images.length === 1 ? "page" : "pages"}
                    </span>
                  </div>
                </div>

                <hr className="border-neutral-100" />

                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={handleConvert}
                    disabled={isConverting || images.length === 0}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-primary py-3.5 px-4 text-sm font-bold text-white shadow-sm hover:bg-brand-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 cursor-pointer"
                  >
                    {isConverting ? (
                      <>
                        <HiArrowPath className="w-4 h-4 animate-spin" />
                        <span>{progressMsg ?? "Converting Images..."}</span>
                      </>
                    ) : (
                      <>
                        <span>Convert to PDF</span>
                        <HiArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-neutral-400 text-center leading-relaxed">
                    All conversion executes locally in your browser.
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
