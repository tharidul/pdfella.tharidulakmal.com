"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { HiArrowUpTray } from "react-icons/hi2";

export interface UploadSignatureTabProps {
  uploadedImageUrl: string | null;
  makeTransparent: boolean;
  setMakeTransparent: (val: boolean) => void;
  onImageFileSelected: (file: File) => void;
}

export function UploadSignatureTab({
  uploadedImageUrl,
  makeTransparent,
  setMakeTransparent,
  onImageFileSelected,
}: UploadSignatureTabProps) {
  const [isDraggingUpload, setIsDraggingUpload] = useState(false);
  const uploadDragCounterRef = useRef(0);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4">
      <div
        onClick={() => uploadInputRef.current?.click()}
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
          uploadDragCounterRef.current++;
          if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setIsDraggingUpload(true);
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          try {
            e.dataTransfer.dropEffect = "copy";
          } catch {
            // Ignore
          }
          if (!isDraggingUpload) setIsDraggingUpload(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          uploadDragCounterRef.current--;
          if (uploadDragCounterRef.current <= 0) {
            uploadDragCounterRef.current = 0;
            setIsDraggingUpload(false);
          }
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          uploadDragCounterRef.current = 0;
          setIsDraggingUpload(false);
          const file = e.dataTransfer.files?.[0];
          if (file) {
            onImageFileSelected(file);
          }
        }}
        className={`w-full rounded-2xl p-8 text-center cursor-pointer transition-colors duration-150 ${
          isDraggingUpload
            ? "border-2 border-solid border-brand-primary bg-brand-subtle ring-4 ring-brand-border shadow-sm"
            : "border border-neutral-200 bg-neutral-50/40 hover:bg-neutral-50/90 hover:border-neutral-300 shadow-2xs"
        }`}
      >
        <input
          ref={uploadInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onImageFileSelected(file);
          }}
        />

        {uploadedImageUrl ? (
          <div className="flex flex-col items-center">
            <Image
              src={uploadedImageUrl}
              alt="Signature preview"
              width={320}
              height={144}
              unoptimized
              className="max-h-36 w-auto object-contain rounded-lg border border-neutral-200 p-3 bg-white shadow-xs"
            />
            <span className="text-xs text-brand-primary font-bold mt-3">
              Click to choose a different image
            </span>
          </div>
        ) : (
          <div>
            <HiArrowUpTray className="w-10 h-10 mx-auto text-neutral-400 mb-2.5" />
            <p className="text-sm font-bold text-neutral-800">
              Upload an image of your signature
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              Supports PNG, JPG, or WebP scans of handwritten signatures
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2.5 px-1">
        <input
          id="make-transparent"
          type="checkbox"
          checked={makeTransparent}
          onChange={(e) => setMakeTransparent(e.target.checked)}
          className="w-4 h-4 rounded border-neutral-300 text-brand-primary focus:ring-brand-primary accent-brand-primary"
        />
        <label
          htmlFor="make-transparent"
          className="text-xs font-medium text-neutral-700 select-none cursor-pointer"
        >
          Auto-remove white paper background (make signature transparent)
        </label>
      </div>
    </div>
  );
}
