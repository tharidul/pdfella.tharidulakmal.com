"use client";

import { useState, useRef, type ChangeEvent } from "react";
import Image from "next/image";
import {
  HiDocumentText,
  HiArrowPath,
  HiCheckCircle,
  HiExclamationTriangle,
  HiArrowRight,
  HiPhoto,
  HiSquares2X2,
} from "react-icons/hi2";
import { DropZone } from "./DropZone";
import {
  validatePdfFile,
  extractPdfMetadata,
  renderPageThumbnail,
  addWatermarkAndDownload,
  formatFileSize,
  type WatermarkType,
} from "@/lib/pdf";

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelected = async (files: FileList) => {
    const file = files[0];
    if (!file) return;

    setErrorMessage(null);
    setSuccessMessage(null);

    const validation = await validatePdfFile(file);
    if (!validation.isValid) {
      setErrorMessage(validation.error);
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
      setErrorMessage(msg);
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
      setErrorMessage(null);
    } catch {
      setErrorMessage("Failed to read watermark image.");
    }
  };

  const handleProcess = async () => {
    if (!fileBuffer || isProcessing) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

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
          setErrorMessage("Please upload an image or logo for the watermark.");
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

      setSuccessMessage("Watermark successfully applied to your document!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to apply watermark.";
      setErrorMessage(msg);
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
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  return (
    <main className="w-full max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-8 flex flex-col">
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
        <div className="flex flex-col gap-6">
          {/* File Overview */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#fdf2f4] text-[#800020] flex items-center justify-center shrink-0">
                <HiDocumentText className="w-6 h-6" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-neutral-900 truncate max-w-xs sm:max-w-md">
                  {fileName}
                </span>
                <span className="text-xs text-neutral-400">
                  {pageCount} {pageCount === 1 ? "page" : "pages"}, {formatFileSize(fileSize)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={resetAll}
              className="text-xs font-semibold text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Choose Different File
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Options Settings Panel (Left 7 Cols) */}
            <div className="md:col-span-7 flex flex-col gap-5 bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-xs">
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
                  Image / Logo Stamp
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
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-neutral-200 bg-neutral-50/50 text-neutral-800 font-bold tracking-wider uppercase focus:outline-hidden focus:border-[#800020]"
                    />
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {PRESET_TEXTS.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setText(preset)}
                          className="px-2.5 py-1 text-[10px] font-bold rounded-md bg-neutral-100 text-neutral-600 hover:bg-[#800020] hover:text-white transition-colors cursor-pointer"
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
                        className="w-full accent-[#800020] cursor-pointer"
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
                                ? "border-[#800020] scale-110 shadow-xs"
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
                          className="text-[11px] text-[#800020] hover:underline font-medium text-left mt-0.5 cursor-pointer"
                        >
                          Change Logo Image
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => imageInputRef.current?.click()}
                      className="border-2 border-dashed border-neutral-300 rounded-xl p-6 text-center cursor-pointer hover:bg-neutral-50 transition-colors"
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
                      className="w-full accent-[#800020] cursor-pointer"
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
                      { label: "-45° Diagonal", val: -45 },
                      { label: "0° Flat", val: 0 },
                      { label: "45° Diagonal", val: 45 },
                    ].map((item) => (
                      <button
                        key={item.val}
                        type="button"
                        onClick={() => setRotation(item.val)}
                        className={`py-1.5 text-[11px] font-bold rounded-lg transition-colors cursor-pointer border ${
                          rotation === item.val
                            ? "bg-[#800020] text-white border-[#800020]"
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
                    Transparency / Opacity ({Math.round(opacity * 100)}%)
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="0.8"
                    step="0.05"
                    value={opacity}
                    onChange={(e) => setOpacity(Number(e.target.value))}
                    className="w-full accent-[#800020] cursor-pointer"
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
                    className="w-4 h-4 rounded-sm border-neutral-300 text-[#800020] focus:ring-[#800020] accent-[#800020]"
                  />
                  <span className="text-xs font-semibold text-neutral-800">
                    Skip first page (Do not watermark cover page)
                  </span>
                </label>
              </div>
            </div>

            {/* Live Visual Preview (Right 5 Cols) */}
            <div className="md:col-span-5 flex flex-col bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-xs items-center justify-between">
              <div className="w-full text-center pb-3 border-b border-neutral-100">
                <span className="text-xs font-bold text-neutral-800">Real-Time Document Preview</span>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Visual approximation of watermark placement
                </p>
              </div>

              {/* Document Mockup with Superimposed Watermark */}
              <div className="relative my-6 w-60 aspect-[1/1.414] bg-white border border-neutral-300 rounded-xl shadow-md overflow-hidden flex items-center justify-center select-none">
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
                        fontSize: `${Math.max(10, fontSize * 0.4)}px`,
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

              <div className="w-full pt-2">
                <button
                  type="button"
                  onClick={handleProcess}
                  disabled={isProcessing}
                  className="w-full py-3 px-6 rounded-xl bg-[#800020] text-white font-bold text-sm hover:bg-[#68001a] transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
              </div>
            </div>
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
