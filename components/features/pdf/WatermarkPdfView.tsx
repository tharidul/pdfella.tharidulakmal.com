"use client";

import { useState, useRef, type ChangeEvent } from "react";
import { HiDocumentText } from "react-icons/hi2";
import { toast } from "@/components/ui/sonner";
import { DropZone } from "./DropZone";
import { formatFileSize, validatePdfFile } from "@/lib/pdf/validation";
import { extractPdfMetadata } from "@/lib/pdf/metadata";
import { renderPageThumbnail } from "@/lib/pdf/render";
import {
  addWatermarkAndDownload,
  type WatermarkType,
} from "@/lib/pdf/watermark";
import { WatermarkPreviewStage } from "./watermark/WatermarkPreviewStage";
import { WatermarkControls } from "./watermark/WatermarkControls";

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

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <WatermarkPreviewStage
              previewThumb={previewThumb}
              watermarkType={watermarkType}
              text={text}
              fontSize={fontSize}
              colorHex={colorHex}
              opacity={opacity}
              rotation={rotation}
              imagePreviewUrl={imagePreviewUrl}
              imageScale={imageScale}
            />

            <WatermarkControls
              watermarkType={watermarkType}
              setWatermarkType={setWatermarkType}
              text={text}
              setText={setText}
              fontSize={fontSize}
              setFontSize={setFontSize}
              colorHex={colorHex}
              setColorHex={setColorHex}
              imagePreviewUrl={imagePreviewUrl}
              imageScale={imageScale}
              setImageScale={setImageScale}
              rotation={rotation}
              setRotation={setRotation}
              opacity={opacity}
              setOpacity={setOpacity}
              skipFirstPage={skipFirstPage}
              setSkipFirstPage={setSkipFirstPage}
              isProcessing={isProcessing}
              onProcess={handleProcess}
              imageInputRef={imageInputRef}
              onImageUploaded={handleImageUploaded}
            />
          </div>
        </div>
      )}
    </main>
  );
}
