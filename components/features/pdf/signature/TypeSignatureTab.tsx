"use client";

import { CURSIVE_FONTS, INK_COLORS } from "./signatureCanvasUtils";

export interface TypeSignatureTabProps {
  typedText: string;
  setTypedText: (text: string) => void;
  selectedFont: string;
  setSelectedFont: (font: string) => void;
  typeColor: string;
  setTypeColor: (color: string) => void;
}

export function TypeSignatureTab({
  typedText,
  setTypedText,
  selectedFont,
  setSelectedFont,
  typeColor,
  setTypeColor,
}: TypeSignatureTabProps) {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-bold text-neutral-700 mb-1.5">
          Type your name:
        </label>
        <input
          type="text"
          value={typedText}
          onChange={(e) => setTypedText(e.target.value)}
          placeholder="e.g. John Doe"
          className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-base text-neutral-900 shadow-2xs focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-neutral-700 mb-2">
          Select Handwriting Style:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {CURSIVE_FONTS.map((font) => (
            <button
              key={font.id}
              type="button"
              onClick={() => setSelectedFont(font.id)}
              className={`p-4 rounded-xl text-center transition-all cursor-pointer bg-white ${
                selectedFont === font.id
                  ? "border-2 border-brand-primary text-brand-primary shadow-xs"
                  : "border border-neutral-200 hover:border-neutral-300 text-neutral-800"
              }`}
            >
              <div
                className="text-2xl leading-tight truncate py-2"
                style={{ fontFamily: font.fontFamily, color: typeColor }}
              >
                {typedText || "Signature"}
              </div>
              <span className="text-[11px] text-neutral-500 block mt-1 font-medium">
                {font.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <span className="text-xs font-semibold text-neutral-600">Ink Color:</span>
        <div className="flex items-center gap-1.5">
          {INK_COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setTypeColor(c.value)}
              title={c.label}
              className={`w-7 h-7 rounded-full border transition-transform cursor-pointer ${
                typeColor === c.value
                  ? "scale-110 ring-2 ring-offset-2 ring-neutral-400 border-white"
                  : "border-neutral-300 hover:scale-105"
              }`}
              style={{ backgroundColor: c.value }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
