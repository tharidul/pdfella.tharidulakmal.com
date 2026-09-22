"use client";

import { useRef, useState, useEffect, type ChangeEvent, type DragEvent } from "react";
import { HiArrowUpTray, HiPlus } from "react-icons/hi2";

export interface DropZoneProps {
  onFilesSelected?: (files: FileList) => void;
  accept?: string;
  multiple?: boolean;
  title?: string;
  subtitle?: string;
}

export function DropZone({
  onFilesSelected,
  accept = ".pdf,application/pdf",
  multiple = true,
  title = "Drop PDF files here",
  subtitle = "You can select multiple files at once. PDF files up to 200 MB are supported.",
}: DropZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounterRef = useRef(0);

  useEffect(() => {
    const handleWindowDragOver = (e: globalThis.DragEvent) => {
      e.preventDefault();
    };
    const handleWindowDrop = (e: globalThis.DragEvent) => {
      e.preventDefault();
    };

    window.addEventListener("dragover", handleWindowDragOver);
    window.addEventListener("drop", handleWindowDrop);

    return () => {
      window.removeEventListener("dragover", handleWindowDragOver);
      window.removeEventListener("drop", handleWindowDrop);
    };
  }, []);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      onFilesSelected?.(event.target.files);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      e.dataTransfer.dropEffect = "copy";
    } catch {
    }
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDragging(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected?.(e.dataTransfer.files);
    }
  };

  return (
    <div
      onClick={handleButtonClick}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`group w-full rounded-2xl py-10 px-6 sm:py-12 sm:px-8 text-center cursor-pointer mb-6 transition-all duration-150 flex flex-col items-center justify-center select-none ${
        isDragging
          ? "border-2 border-solid border-brand-primary bg-brand-subtle ring-4 ring-brand-border shadow-sm"
          : "border border-neutral-200/90 bg-neutral-50/40 hover:bg-neutral-50/90 hover:border-neutral-300 shadow-2xs hover:shadow-xs"
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        className="hidden"
        onChange={handleInputChange}
      />

      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3.5 transition-all duration-150 ${
          isDragging
            ? "bg-brand-primary text-white ring-4 ring-brand-border"
            : "bg-white text-brand-primary border border-neutral-200/80 shadow-2xs group-hover:border-brand-border"
        }`}
      >
        <HiArrowUpTray className="w-5 h-5" />
      </div>

      <h2 className="text-base font-bold text-neutral-900 leading-snug">
        {isDragging ? "Release to drop files here" : title}
      </h2>

      <p className="text-xs text-neutral-500 mt-1 max-w-md leading-relaxed">
        {subtitle}
      </p>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleButtonClick();
        }}
        className="mt-4 px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-semibold transition-colors shadow-2xs hover:shadow-xs cursor-pointer inline-flex items-center gap-1.5"
      >
        <HiPlus className="w-3.5 h-3.5" />
        <span>Select Files</span>
      </button>
    </div>
  );
}
