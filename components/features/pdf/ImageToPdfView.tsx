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
  HiCheckCircle,
  HiExclamationTriangle,
} from "react-icons/hi2";
import {
  convertImagesAndDownload,
  type ImageItem,
  type ImagePageSize,
  type ImageOrientation,
  type ImageMargin,
} from "@/lib/pdf";

export function ImageToPdfView() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [pageSize, setPageSize] = useState<ImagePageSize>("a4");
  const [orientation, setOrientation] = useState<ImageOrientation>("auto");
  const [margin, setMargin] = useState<ImageMargin>("none");
  const [isConverting, setIsConverting] = useState(false);
  const [progressMsg, setProgressMsg] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
    setErrorMessage(null);
    setSuccessMessage(null);

    const validImages = files.filter((f) =>
      ["image/jpeg", "image/png", "image/webp", "image/bmp"].includes(f.type) ||
      /\.(jpe?g|png|webp|bmp)$/i.test(f.name)
    );

    if (validImages.length === 0) {
      setErrorMessage("Please select valid image files (JPG, PNG, WebP, or BMP).");
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
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleConvert = async () => {
    if (images.length === 0 || isConverting) return;

    setIsConverting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

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

      setSuccessMessage(
        `Successfully converted ${images.length} ${
          images.length === 1 ? "image" : "images"
        } into a PDF document!`
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to convert images to PDF.";
      setErrorMessage(msg);
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
    <main className="w-full max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-8 flex flex-col">
      <div className="flex flex-col mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight mb-1.5">
          Convert images to PDF
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500">
          Upload JPG, PNG, or WebP images and compile them into a PDF document.
        </p>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/bmp"
        className="hidden"
        onChange={handleFilesAdded}
      />

      {/* Dropzone & Upload State */}
      {images.length === 0 ? (
        <div
          onClick={handleSelectFiles}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files.length > 0) {
              processIncomingFiles(Array.from(e.dataTransfer.files));
            }
          }}
          className="w-full border-2 border-dashed border-[#f48a97] rounded-3xl py-14 px-6 bg-white hover:bg-[#fffbfc] transition-all duration-200 flex flex-col items-center justify-center text-center cursor-pointer shadow-xs"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#800020] text-white flex items-center justify-center mb-4 shadow-sm">
            <HiPlus className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-neutral-900 leading-tight">
            Select or drop images here
          </h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-xs">
            Supports JPG, PNG, WebP, and BMP. You can select multiple files at once.
          </p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleSelectFiles();
            }}
            className="mt-5 px-6 py-2 rounded-xl bg-[#800020] text-white text-xs font-bold hover:bg-[#68001a] transition-colors shadow-xs cursor-pointer"
          >
            Choose Images
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Top Actions & Settings */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectFiles}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-neutral-200 text-neutral-700 bg-white hover:bg-neutral-50 text-xs font-semibold transition-colors cursor-pointer"
              >
                <HiPlus className="w-4 h-4 text-[#800020]" />
                Add More Images
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-neutral-500 hover:text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors cursor-pointer"
              >
                <HiTrash className="w-4 h-4" />
                Clear All
              </button>
            </div>

            <div className="flex items-center gap-3 text-xs text-neutral-500">
              <span className="font-semibold text-neutral-800">
                {images.length} {images.length === 1 ? "image" : "images"} selected
              </span>
            </div>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-xs">
            {/* Page Size */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-bold text-neutral-700">Page Size</label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value as ImagePageSize)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 bg-neutral-50/50 text-neutral-800 focus:outline-hidden focus:border-[#800020] focus:ring-1 focus:ring-[#800020]"
              >
                <option value="a4">A4 (Standard 210 × 297 mm)</option>
                <option value="letter">US Letter (8.5 × 11 in)</option>
                <option value="fit">Fit to Image (Original Size)</option>
              </select>
            </div>

            {/* Orientation */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-bold text-neutral-700">Orientation</label>
              <select
                value={orientation}
                disabled={pageSize === "fit"}
                onChange={(e) => setOrientation(e.target.value as ImageOrientation)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 bg-neutral-50/50 text-neutral-800 focus:outline-hidden focus:border-[#800020] focus:ring-1 focus:ring-[#800020] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="auto">Auto (Match Image Ratio)</option>
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>

            {/* Margins */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-bold text-neutral-700">Page Margins</label>
              <select
                value={margin}
                onChange={(e) => setMargin(e.target.value as ImageMargin)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 bg-neutral-50/50 text-neutral-800 focus:outline-hidden focus:border-[#800020] focus:ring-1 focus:ring-[#800020]"
              >
                <option value="none">No Margin (Full Bleed)</option>
                <option value="small">Small Margin (20pt)</option>
                <option value="large">Large Margin (40pt)</option>
              </select>
            </div>
          </div>

          {/* Reorderable Image Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((item, index) => (
              <div
                key={item.id}
                className="group relative flex flex-col bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-shadow"
              >
                <div className="relative w-full aspect-3/4 bg-neutral-100 flex items-center justify-center overflow-hidden">
                  <Image
                    src={item.previewUrl}
                    alt={item.name}
                    fill
                    unoptimized
                    className="object-contain p-2"
                  />
                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                    #{index + 1}
                  </div>
                </div>

                <div className="p-3 flex flex-col justify-between flex-1 bg-white border-t border-neutral-100">
                  <div className="min-w-0">
                    <p
                      className="text-xs font-semibold text-neutral-800 truncate"
                      title={item.name}
                    >
                      {item.name}
                    </p>
                    <span className="text-[10px] text-neutral-400">
                      {formatSize(item.size)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-neutral-100">
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
                      className="w-6 h-6 rounded flex items-center justify-center text-neutral-400 hover:text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                    >
                      <HiTrash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Execution Section */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col text-center sm:text-left">
              <span className="text-sm font-bold text-neutral-900">
                Ready to Generate Document
              </span>
              <span className="text-xs text-neutral-500 mt-0.5">
                Output will contain {images.length} {images.length === 1 ? "page" : "pages"}.
              </span>
            </div>

            <button
              type="button"
              onClick={handleConvert}
              disabled={isConverting || images.length === 0}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#800020] text-white font-bold text-sm hover:bg-[#68001a] transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
          </div>
        </div>
      )}

      {/* Notifications */}
      {errorMessage && (
        <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2.5">
          <HiExclamationTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="mt-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
          <HiCheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
    </main>
  );
}
