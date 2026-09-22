"use client";

import { useState, useRef, useEffect } from "react";
import {
  HiXMark,
  HiCheck,
  HiPencil,
  HiOutlineDocumentText,
  HiArrowUpTray,
  HiArrowDownTray,
} from "react-icons/hi2";
import { downloadSignatureImage } from "@/lib/pdf/sign";
import {
  type PenStyle,
  type Stroke,
  getCroppedCanvasDataUrl,
  generateTypedPng,
  filterWhiteBackgroundToTransparent,
  CURSIVE_FONTS,
} from "./signature/signatureCanvasUtils";
import { DrawSignatureTab } from "./signature/DrawSignatureTab";
import { TypeSignatureTab } from "./signature/TypeSignatureTab";
import { UploadSignatureTab } from "./signature/UploadSignatureTab";

export interface SignaturePadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dataUrl: string, label: string) => void;
}

type TabType = "draw" | "type" | "upload";

export function SignaturePadModal({ isOpen, onClose, onSave }: SignaturePadModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("draw");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("#000000");
  const [selectedWidth, setSelectedWidth] = useState<number>(4.5);
  const [selectedPenStyle, setSelectedPenStyle] = useState<PenStyle>("fountain");

  const [typedText, setTypedText] = useState("John Doe");
  const [selectedFont, setSelectedFont] = useState(CURSIVE_FONTS[0]!.id);
  const [typeColor, setTypeColor] = useState("#000000");

  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [makeTransparent, setMakeTransparent] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z" && activeTab === "draw") {
        e.preventDefault();
        setStrokes((prev) => prev.slice(0, -1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, activeTab]);

  const handleImageFileSelected = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (!makeTransparent) {
        setUploadedImageUrl(result);
        return;
      }
      filterWhiteBackgroundToTransparent(result, (transparentUrl) => {
        setUploadedImageUrl(transparentUrl);
      });
    };
    reader.readAsDataURL(file);
  };

  const getActiveSignatureDataUrl = (): string | null => {
    if (activeTab === "draw") {
      const canvas = canvasRef.current;
      if (!canvas || strokes.length === 0) return null;
      return getCroppedCanvasDataUrl(canvas);
    } else if (activeTab === "type") {
      if (!typedText.trim()) return null;
      return generateTypedPng(typedText, selectedFont, typeColor);
    } else if (activeTab === "upload") {
      return uploadedImageUrl;
    }
    return null;
  };

  const handleDownloadSignature = (background: "transparent" | "white") => {
    const dataUrl = getActiveSignatureDataUrl();
    if (!dataUrl) return;

    const baseName =
      activeTab === "type" && typedText.trim()
        ? `signature-${typedText.trim().toLowerCase().replace(/[^a-z0-9]/g, "-")}`
        : "signature";

    downloadSignatureImage(dataUrl, background, baseName);
  };

  const handleSaveSignature = () => {
    const dataUrl = getActiveSignatureDataUrl();
    if (!dataUrl) return;

    setStrokes([]);
    setCurrentStroke(null);

    const label =
      activeTab === "type"
        ? `Signature (${typedText})`
        : activeTab === "upload"
        ? "Signature (Upload)"
        : "Signature";

    onSave(dataUrl, label);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-neutral-200">
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-neutral-900">Create Signature</h3>
            <p className="text-xs text-neutral-600 mt-0.5">
              Draw, type, or upload your signature. All processing is 100% private in your browser.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 transition-colors cursor-pointer"
          >
            <HiXMark className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-neutral-200 bg-neutral-50 px-6 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab("draw")}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition-colors cursor-pointer ${
              activeTab === "draw"
                ? "border-brand-primary text-brand-primary"
                : "border-transparent text-neutral-600 hover:text-neutral-900"
            }`}
          >
            <HiPencil className="w-4 h-4" />
            Draw Signature
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("type")}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition-colors cursor-pointer ${
              activeTab === "type"
                ? "border-brand-primary text-brand-primary"
                : "border-transparent text-neutral-600 hover:text-neutral-900"
            }`}
          >
            <HiOutlineDocumentText className="w-4 h-4" />
            Type Signature
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition-colors cursor-pointer ${
              activeTab === "upload"
                ? "border-brand-primary text-brand-primary"
                : "border-transparent text-neutral-600 hover:text-neutral-900"
            }`}
          >
            <HiArrowUpTray className="w-4 h-4" />
            Upload Scan
          </button>
        </div>

        <div className="p-6">
          {activeTab === "draw" && (
            <DrawSignatureTab
              canvasRef={canvasRef}
              strokes={strokes}
              setStrokes={setStrokes}
              currentStroke={currentStroke}
              setCurrentStroke={setCurrentStroke}
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
              selectedWidth={selectedWidth}
              setSelectedWidth={setSelectedWidth}
              selectedPenStyle={selectedPenStyle}
              setSelectedPenStyle={setSelectedPenStyle}
            />
          )}

          {activeTab === "type" && (
            <TypeSignatureTab
              typedText={typedText}
              setTypedText={setTypedText}
              selectedFont={selectedFont}
              setSelectedFont={setSelectedFont}
              typeColor={typeColor}
              setTypeColor={setTypeColor}
            />
          )}

          {activeTab === "upload" && (
            <UploadSignatureTab
              uploadedImageUrl={uploadedImageUrl}
              makeTransparent={makeTransparent}
              setMakeTransparent={setMakeTransparent}
              onImageFileSelected={handleImageFileSelected}
            />
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between border-t border-neutral-200 bg-neutral-50 px-6 py-4 gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-neutral-500 mr-1 hidden sm:inline">
              Download PNG:
            </span>

            <button
              type="button"
              onClick={() => handleDownloadSignature("transparent")}
              disabled={
                (activeTab === "draw" && strokes.length === 0) ||
                (activeTab === "type" && !typedText.trim()) ||
                (activeTab === "upload" && !uploadedImageUrl)
              }
              title="Download signature with transparent background (PNG)"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50 hover:border-neutral-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs cursor-pointer"
            >
              <HiArrowDownTray className="w-3.5 h-3.5 text-neutral-600" />
              <span>Transparent</span>
              <span className="text-[9px] bg-brand-subtle text-brand-primary px-1.5 py-0.5 rounded font-bold">
                Clear
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleDownloadSignature("white")}
              disabled={
                (activeTab === "draw" && strokes.length === 0) ||
                (activeTab === "type" && !typedText.trim()) ||
                (activeTab === "upload" && !uploadedImageUrl)
              }
              title="Download signature with solid white background (PNG)"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50 hover:border-neutral-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs cursor-pointer"
            >
              <HiArrowDownTray className="w-3.5 h-3.5 text-neutral-600" />
              <span>White BG</span>
              <span className="text-[9px] bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded font-bold">
                Solid
              </span>
            </button>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveSignature}
              disabled={
                (activeTab === "draw" && strokes.length === 0) ||
                (activeTab === "type" && !typedText.trim()) ||
                (activeTab === "upload" && !uploadedImageUrl)
              }
              className="flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-brand-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <HiCheck className="w-4 h-4" />
              <span>Place on Document</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
