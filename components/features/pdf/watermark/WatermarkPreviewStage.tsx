"use client";

import Image from "next/image";
import { HiSquares2X2 } from "react-icons/hi2";
import type { WatermarkType } from "@/lib/pdf/watermark";

export interface WatermarkPreviewStageProps {
  previewThumb: string;
  watermarkType: WatermarkType;
  text: string;
  fontSize: number;
  colorHex: string;
  opacity: number;
  rotation: number;
  imagePreviewUrl: string;
  imageScale: number;
}

export function WatermarkPreviewStage({
  previewThumb,
  watermarkType,
  text,
  fontSize,
  colorHex,
  opacity,
  rotation,
  imagePreviewUrl,
  imageScale,
}: WatermarkPreviewStageProps) {
  return (
    <div className="md:col-span-7 flex flex-col bg-white rounded-2xl border border-neutral-200/80 p-5 sm:p-6 shadow-2xs items-center justify-between">
      <div className="w-full text-center pb-3 border-b border-neutral-100">
        <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider">Real-Time Document Preview</span>
        <p className="text-[11px] text-neutral-400 mt-0.5">
          Visual approximation of watermark placement on Page 1
        </p>
      </div>

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
  );
}
