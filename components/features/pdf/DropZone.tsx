"use client";

import { useRef, type ChangeEvent } from "react";
import { PlusIcon } from "@/components/common/icons";

interface DropZoneProps {
  onFilesSelected?: (files: FileList) => void;
}

export function DropZone({ onFilesSelected }: DropZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      onFilesSelected?.(event.target.files);
    }
  };

  return (
    <div
      onClick={handleButtonClick}
      className="w-full border-2 border-dashed border-[#f48a97] rounded-2xl py-10 px-6 bg-white hover:bg-[#fffbfc] transition-colors flex flex-col items-center justify-center text-center cursor-pointer mb-6"
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={handleInputChange}
      />

      <div className="w-10 h-10 rounded-full bg-[#800020] text-white flex items-center justify-center mb-3 shadow-2xs">
        <PlusIcon className="w-5 h-5" />
      </div>

      <h2 className="text-base font-bold text-neutral-800 leading-tight">
        Drop PDF files here
      </h2>
      <span className="text-xs text-neutral-600 my-1 font-normal">or</span>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleButtonClick();
        }}
        className="mt-1 px-6 py-1.5 rounded-lg border border-[#800020] text-[#800020] bg-white hover:bg-[#800020]/5 text-xs font-bold transition-colors shadow-2xs cursor-pointer"
      >
        Select Files
      </button>

      <p className="text-xs text-neutral-600 mt-4 font-normal">
        You can select multiple files at once. Only PDF files are supported.
      </p>
    </div>
  );
}
