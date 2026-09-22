"use client";

import { useState, useRef, type ChangeEvent } from "react";
import Image from "next/image";
import {
  HiDocumentText,
  HiArrowPath,
  HiArrowRight,
  HiPhoto,
  HiSquares2X2,
} from "react-icons/hi2";
import { toast } from "@/components/ui/sonner";
import { DropZone } from "./DropZone";
import { formatFileSize, validatePdfFile } from "@/lib/pdf/validation";
import { extractPdfMetadata } from "@/lib/pdf/metadata";
import { renderPageThumbnail } from "@/lib/pdf/render";
import {
  addWatermarkAndDownload,
  type WatermarkType,
} from "@/lib/pdf/watermark";

const PRESET_TEXTS = ["CONFIDENTIAL", "DRAFT", "SAMPLE", "COPY", "URGENT", "ORIGINAL"];

const COLOR_PRESETS = [
  { label: "Muted Crimson", value: "#cc2222" },
  { label: "Slate Gray", value: "#555555" },
  { label: "Deep Navy", value: "#1e3a8a" },
  { label: "Burgundy", value: "#800020" },
];

export function WatermarkPdfView() {
  const [hasFile, setHasFile] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [previewThumb, setPreviewThumb] = useState<string>("");

  const [watermarkType, setWatermarkType] = useState<WatermarkType>("text");
  const [text, setText] = useState("CONFIDENTIAL");
  const [fontSize, setFontSize] = useState<number>(44);
  const [colorHex, setColorHex] = useState<string>("#cc2222");
  const [opacity, setOpacity] = useState<number>(0.25);
  const [rotation, setRotation] = useState<number>(-45);
  const [skipFirstPage, setSkipFirstPage] = useState<boolean>(false);

  // Image watermark state
  const [imageBuffer, setImageBuffer] = useState<ArrayBuffer | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("");
  const [isPng, setIsPng] = useState(false);
  const [imageScale, setImageScale] = useState<number>(0.5);

  const [isProcessing, setIsProcessing] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);

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
      const metadata = await extractPdfMetadata(buffer, file.name);

      setFileName(file.name);
      setFileSize(buffer.byteLength);
      setPageCount(metadata.pageCount);
      setFileBuffer(buffer);
      setHasFile(true);

      const thumb = await renderPageThumbnail(buffer, 1, { width: 280, height: 380, quality: 0.85 });
      setPreviewThumb(thumb);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to read PDF document.";
      toast.error(msg);
    }
  };

  const handleImageUploaded = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const buf = await file.arrayBuffer();
      setImageBuffer(buf);
      setIsPng(file.type === "image/png");
      setImagePreviewUrl(URL.createObjectURL(file));
    } catch {
      toast.error("Failed to read watermark image.");
    }
  };

  const handleProcess = async () => {
    if (!fileBuffer || isProcessing) return;

    setIsProcessing(true);

    try {
      if (watermarkType === "text") {
        await addWatermarkAndDownload(fileBuffer, fileName, {
          type: "text",
          text: text.trim() || "CONFIDENTIAL",
          fontSize,
          colorHex,
          opacity,
          rotation,
          skipFirstPage,
        });
      } else {
        if (!imageBuffer) {
          toast.error("Please upload an image or logo for the watermark.");
          setIsProcessing(false);
          return;
        }

        await addWatermarkAndDownload(fileBuffer, fileName, {
          type: "image",
          imageBuffer,
          isPng,
          scale: imageScale,
          opacity,
          rotation,
          skipFirstPage,
        });
      }

      toast.success("Watermark successfully applied to your document!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to apply watermark.";
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAll = () => {
    setHasFile(false);
    setFileName("");
    setFileSize(0);
    setPageCount(0);
    setFileBuffer(null);
    setPreviewThumb("");
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImageBuffer(null);
    setImagePreviewUrl("");
  };

  return (
    <main
      className={
        hasFile
          ? "w-full max-w-6xl mx-auto px-4 py-6 flex flex-col"
          : "w-full max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-8 flex flex-col"
      }
    >
      <div className="flex flex-col mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight mb-1.5">
          Add watermark to PDF
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500">
          Stamp text or image watermarks onto your PDF pages with custom position, rotation, and opacity.
        </p>
      </div>

      {!hasFile ? (
        <DropZone onFilesSelected={handleFilesSelected} />
      ) : (
        <div className="space-y-6">
          {/* File Meta Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-neutral-50/80 px-5 py-3.5 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-subtle text-brand-primary flex items-center justify-center shrink-0">
                <HiDocumentText className="w-5 h-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-neutral-900 truncate max-w-xs sm:max-w-md">
                  {fileName}
                </span>
                <span className="text-xs text-neutral-400 mt-0.5">
                  {formatFileSize(fileSize)} • {pageCount} {pageCount === 1 ? "page" : "pages"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={resetAll}
              className="text-xs font-semibold text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Choose different file
            </button>
          </div>

          {/* 2-Column Split: Left = Document Preview, Right = Sticky Options & Action Toolbar */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left Column: Real-Time Document Preview (7 Cols) */}
            <div className="md:col-span-7 flex flex-col bg-white rounded-2xl border border-neutral-200/80 p-5 sm:p-6 shadow-2xs items-center justify-between">
              <div className="w-full text-center pb-3 border-b border-neutral-100">
                <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider">Real-Time Document Preview</span>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Visual approximation of watermark placement on Page 1
                </p>
              </div>

              {/* Document Mockup with Superimposed Watermark */}
              <div className="relative my-6 w-64 sm:w-80 aspect-[1/1.414] bg-white border border-neutral-300 rounded-xl shadow-md overflow-hidden flex items-center justify-center select-none">
                {previewThumb ? (
                  <Image
                    src={previewThumb}
                    alt="Page Preview"
                    fill
                    unoptimized
                    className="object-contain p-1"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-neutral-400 gap-1">
                    <HiSquares2X2 className="w-8 h-8 animate-pulse text-neutral-300" />
                    <span className="text-[10px]">Loading preview...</span>
                  </div>
                )}

                {/* Simulated Watermark Overlay */}
                <div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
                  style={{ opacity }}
                >
                  {watermarkType === "text" ? (
                    <span
                      className="font-black whitespace-nowrap uppercase tracking-widest transition-all duration-150 text-center select-none"
                      style={{
                        transform: `rotate(${rotation}deg)`,
                        color: colorHex,
                        fontSize: `${Math.max(12, fontSize * 0.55)}px`,
                      }}
                    >
                      {text.trim() || "CONFIDENTIAL"}
                    </span>
                  ) : imagePreviewUrl ? (
                    <div
                      className="relative transition-all duration-150 flex items-center justify-center pointer-events-none"
                      style={{
                        transform: `rotate(${rotation}deg)`,
                        width: `${Math.round(imageScale * 100)}%`,
                        height: `${Math.round(imageScale * 100)}%`,
                      }}
                    >
                      <Image
                        src={imagePreviewUrl}
                        alt="Watermark preview"
                        fill
                        unoptimized
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-neutral-400">No logo uploaded</span>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Options Settings Panel & Action Button (5 Cols, Sticky) */}
            <div className="md:col-span-5 md:sticky md:top-6 self-start">
              <div className="flex flex-col gap-5 bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs">
                {/* Type Switcher */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-100 rounded-xl border border-neutral-200/60">
                  <button
                    type="button"
                    onClick={() => setWatermarkType("text")}
                    className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      watermarkType === "text"
                        ? "bg-white text-neutral-900 shadow-xs"
                        : "text-neutral-600 hover:text-neutral-900"
                    }`}
                  >
                    Text Watermark
                  </button>
                  <button
                    type="button"
                    onClick={() => setWatermarkType("image")}
                    className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      watermarkType === "image"
                        ? "bg-white text-neutral-900 shadow-xs"
                        : "text-neutral-600 hover:text-neutral-900"
                    }`}
                  >
                    Image Stamp
                  </button>
                </div>

                {watermarkType === "text" ? (
                  <>
                    {/* Text Input & Presets */}
                    <div className="flex flex-col space-y-2">
                      <label className="text-xs font-bold text-neutral-700">Watermark Text</label>
                      <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="e.g. CONFIDENTIAL"
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-neutral-200 bg-neutral-50/50 text-neutral-800 font-bold tracking-wider uppercase focus:outline-hidden focus:border-brand-primary"
                      />
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {PRESET_TEXTS.map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setText(preset)}
                            className="px-2.5 py-1 text-[10px] font-bold rounded-md bg-neutral-100 text-neutral-600 hover:bg-brand-primary hover:text-white transition-colors cursor-pointer"
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Font Size & Color */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col space-y-2">
                        <label className="text-xs font-bold text-neutral-700">
                          Font Size ({fontSize} pt)
                        </label>
                        <input
                          type="range"
                          min="24"
                          max="80"
                          step="2"
                          value={fontSize}
                          onChange={(e) => setFontSize(Number(e.target.value))}
                          className="w-full accent-brand-primary cursor-pointer"
                        />
                      </div>

                      <div className="flex flex-col space-y-2">
                        <label className="text-xs font-bold text-neutral-700">Color</label>
                        <div className="flex items-center gap-2">
                          {COLOR_PRESETS.map((c) => (
                            <button
                              key={c.value}
                              type="button"
                              onClick={() => setColorHex(c.value)}
                              title={c.label}
                              className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                                colorHex === c.value
                                  ? "border-brand-primary scale-110 shadow-xs"
                                  : "border-transparent hover:scale-105"
                              }`}
                              style={{ backgroundColor: c.value }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Image Stamp Upload */
                  <div className="flex flex-col space-y-3">
                    <label className="text-xs font-bold text-neutral-700">Watermark Image / Logo</label>
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/png,image/jpeg"
                      className="hidden"
                      onChange={handleImageUploaded}
                    />

                    {imagePreviewUrl ? (
                      <div className="flex items-center gap-4 p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                        <div className="relative w-14 h-14 bg-white rounded-lg border border-neutral-200 flex items-center justify-center overflow-hidden">
                          <Image
                            src={imagePreviewUrl}
                            alt="Watermark Logo"
                            fill
                            unoptimized
                            className="object-contain p-1"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-neutral-800">Logo Loaded</span>
                          <button
                            type="button"
                            onClick={() => imageInputRef.current?.click()}
                            className="text-[11px] text-brand-primary hover:underline font-medium text-left mt-0.5 cursor-pointer"
                          >
                            Change Logo Image
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => imageInputRef.current?.click()}
                        className="border border-neutral-200 bg-neutral-50/40 rounded-xl p-6 text-center cursor-pointer hover:bg-neutral-50 hover:border-neutral-300 transition-colors shadow-2xs"
                      >
                        <HiPhoto className="w-8 h-8 text-neutral-400 mx-auto mb-1" />
                        <span className="text-xs font-bold text-neutral-700">Click to upload logo</span>
                        <p className="text-[11px] text-neutral-400">PNG with transparency recommended</p>
                      </div>
                    )}

                    <div className="flex flex-col space-y-2 pt-2">
                      <label className="text-xs font-bold text-neutral-700">
                        Logo Scale ({Math.round(imageScale * 100)}%)
                      </label>
                      <input
                        type="range"
                        min="0.2"
                        max="1.0"
                        step="0.05"
                        value={imageScale}
                        onChange={(e) => setImageScale(Number(e.target.value))}
                        className="w-full accent-brand-primary cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {/* Rotation & Opacity (Shared) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-neutral-100">
                  <div className="flex flex-col space-y-2">
                    <label className="text-xs font-bold text-neutral-700">
                      Rotation ({rotation}&deg;)
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { label: "-45°", val: -45 },
                        { label: "0°", val: 0 },
                        { label: "45°", val: 45 },
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => setRotation(item.val)}
                          className={`py-1.5 text-[11px] font-bold rounded-lg transition-colors cursor-pointer border ${
                            rotation === item.val
                              ? "bg-brand-primary text-white border-brand-primary"
                              : "bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <label className="text-xs font-bold text-neutral-700">
                      Opacity ({Math.round(opacity * 100)}%)
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="0.8"
                      step="0.05"
                      value={opacity}
                      onChange={(e) => setOpacity(Number(e.target.value))}
                      className="w-full accent-brand-primary cursor-pointer"
                    />
                  </div>
                </div>

                {/* Cover Page */}
                <div className="pt-2 border-t border-neutral-100">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={skipFirstPage}
                      onChange={(e) => setSkipFirstPage(e.target.checked)}
                      className="w-4 h-4 rounded-sm border-neutral-300 text-brand-primary focus:ring-brand-primary accent-brand-primary"
                    />
                    <span className="text-xs font-semibold text-neutral-800">
                      Skip first page (Do not watermark cover page)
                    </span>
                  </label>
                </div>

                <hr className="border-neutral-100" />

                {/* Primary Execute Button */}
                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={handleProcess}
                    disabled={isProcessing}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-primary py-3.5 px-4 text-sm font-bold text-white shadow-sm hover:bg-brand-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer hover:shadow"
                  >
                    {isProcessing ? (
                      <>
                        <HiArrowPath className="w-4 h-4 animate-spin" />
                        <span>Applying Watermark...</span>
                      </>
                    ) : (
                      <>
                        <span>Apply Watermark</span>
                        <HiArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-neutral-400 text-center leading-relaxed">
                    All watermarking executes locally in your browser.
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
