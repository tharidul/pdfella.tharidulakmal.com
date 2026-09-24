"use client";

import Image from "next/image";
import { HiPhoto, HiArrowPath, HiArrowRight } from "react-icons/hi2";
import type { WatermarkType } from "@/lib/pdf/watermark";

export const PRESET_TEXTS = ["CONFIDENTIAL", "DRAFT", "SAMPLE", "COPY", "URGENT", "ORIGINAL"];

export const COLOR_PRESETS = [
  { label: "Muted Crimson", value: "#cc2222" },
  { label: "Slate Gray", value: "#555555" },
  { label: "Deep Navy", value: "#1e3a8a" },
  { label: "Burgundy", value: "#800020" },
];

export interface WatermarkControlsProps {
  watermarkType: WatermarkType;
  setWatermarkType: (t: WatermarkType) => void;
  text: string;
  setText: (t: string) => void;
  fontSize: number;
  setFontSize: (s: number) => void;
  colorHex: string;
  setColorHex: (c: string) => void;
  imagePreviewUrl: string;
  imageScale: number;
  setImageScale: (s: number) => void;
  rotation: number;
  setRotation: (r: number) => void;
  opacity: number;
  setOpacity: (o: number) => void;
  skipFirstPage: boolean;
  setSkipFirstPage: (s: boolean) => void;
  isProcessing: boolean;
  onProcess: () => void;
  imageInputRef: React.RefObject<HTMLInputElement | null>;
  onImageUploaded: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function WatermarkControls({
  watermarkType,
  setWatermarkType,
  text,
  setText,
  fontSize,
  setFontSize,
  colorHex,
  setColorHex,
  imagePreviewUrl,
  imageScale,
  setImageScale,
  rotation,
  setRotation,
  opacity,
  setOpacity,
  skipFirstPage,
  setSkipFirstPage,
  isProcessing,
  onProcess,
  imageInputRef,
  onImageUploaded,
}: WatermarkControlsProps) {
  return (
    <div className="md:col-span-5 md:sticky md:top-6 self-start">
      <div className="flex flex-col gap-5 bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs">
        <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-100 rounded-xl border border-neutral-200/60">
          <button
            type="button"
            onClick={() => setWatermarkType("text")}
            className={`py-2 text-xs font-bold rounded-lg transition-colors duration-150 cursor-pointer ${
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
            className={`py-2 text-xs font-bold rounded-lg transition-colors duration-150 cursor-pointer ${
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
            <div className="flex flex-col space-y-2">
              <label htmlFor="watermark-text-input" className="text-xs font-bold text-neutral-700">
                Watermark Text
              </label>
              <input
                id="watermark-text-input"
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
                    className="px-2.5 py-1 text-xs font-semibold rounded-md bg-neutral-100 text-neutral-700 hover:bg-brand-primary hover:text-white transition-colors cursor-pointer min-h-[30px] flex items-center"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col space-y-2">
                <label htmlFor="watermark-font-size-input" className="text-xs font-bold text-neutral-700">
                  Font Size ({fontSize} pt)
                </label>
                <input
                  id="watermark-font-size-input"
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
                <span className="text-xs font-bold text-neutral-700">Color</span>
                <div className="flex items-center gap-2">
                  {COLOR_PRESETS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setColorHex(c.value)}
                      title={c.label}
                      aria-label={`Watermark color: ${c.label}`}
                      className={`w-8 h-8 min-w-[32px] min-h-[32px] rounded-full border-2 transition-colors duration-150 cursor-pointer ${
                        colorHex === c.value
                          ? "border-brand-primary ring-2 ring-brand-primary/30"
                          : "border-neutral-200 hover:border-neutral-400"
                      }`}
                      style={{ backgroundColor: c.value }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col space-y-3">
            <span className="text-xs font-bold text-neutral-700">Watermark Image / Logo</span>
            <input
              ref={imageInputRef}
              id="watermark-image-input"
              type="file"
              accept="image/png,image/jpeg"
              className="sr-only"
              onChange={onImageUploaded}
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
                    className="text-xs text-brand-primary hover:underline font-semibold text-left mt-1 cursor-pointer"
                  >
                    Change Logo Image
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                aria-label="Upload watermark logo image"
                className="w-full border border-neutral-200 bg-neutral-50/40 rounded-xl p-6 text-center cursor-pointer hover:bg-neutral-50 hover:border-neutral-300 transition-colors shadow-2xs block"
              >
                <HiPhoto className="w-8 h-8 text-neutral-500 mx-auto mb-1" />
                <span className="text-xs font-bold text-neutral-700 block">Click to upload logo</span>
                <p className="text-xs text-neutral-600 mt-0.5">PNG with transparency recommended</p>
              </button>
            )}

            <div className="flex flex-col space-y-2 pt-2">
              <label htmlFor="watermark-scale-input" className="text-xs font-bold text-neutral-700">
                Logo Scale ({Math.round(imageScale * 100)}%)
              </label>
              <input
                id="watermark-scale-input"
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-neutral-100">
          <div className="flex flex-col space-y-2">
            <span className="text-xs font-bold text-neutral-700">
              Rotation ({rotation}&deg;)
            </span>
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
                  aria-label={`Rotate watermark ${item.label}`}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer border min-h-[32px] ${
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
            <label htmlFor="watermark-opacity-input" className="text-xs font-bold text-neutral-700">
              Opacity ({Math.round(opacity * 100)}%)
            </label>
            <input
              id="watermark-opacity-input"
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

        <div className="space-y-2.5">
          <button
            type="button"
            onClick={onProcess}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-primary py-3.5 px-4 text-sm font-bold text-white shadow-sm hover:bg-brand-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 cursor-pointer min-h-[44px]"
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

          <p className="text-xs text-neutral-600 text-center leading-relaxed">
            All watermarking executes locally in your browser.
          </p>
        </div>
      </div>
    </div>
  );
}
