"use client";

import { useState } from "react";
import {
  HiPlus,
  HiCalendar,
  HiShieldCheck,
  HiArrowPath,
  HiArrowDownTray,
} from "react-icons/hi2";
import { FaSignature } from "react-icons/fa6";
import { downloadSignatureImage, type SignaturePlacement } from "@/lib/pdf/sign";

export interface SignaturesSidebarProps {
  placements: SignaturePlacement[];
  activePage: number;
  selectedPlacementId: string | null;
  isProcessing: boolean;
  onOpenCreateModal: () => void;
  onAddDateStamp: () => void;
  onSelectPlacement: (id: string, pageNumber: number) => void;
  onDeletePlacement: (id: string) => void;
  onClearAllPlacements: () => void;
  onSignPdf: () => void;
}

export function SignaturesSidebar({
  placements,
  activePage,
  selectedPlacementId,
  isProcessing,
  onOpenCreateModal,
  onAddDateStamp,
  onSelectPlacement,
  onDeletePlacement,
  onClearAllPlacements,
  onSignPdf,
}: SignaturesSidebarProps) {
  const [sidebarDownloadMenuId, setSidebarDownloadMenuId] = useState<string | null>(null);

  return (
    <div className="lg:col-span-4 flex flex-col gap-6">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-base font-bold text-neutral-900 mb-1">Sign & Annotate</h2>
          <p className="text-xs text-neutral-500 mb-4">
            Add custom signatures or official date stamps, then drag them anywhere on the page.
          </p>

          <div className="space-y-2">
            <button
              type="button"
              onClick={onOpenCreateModal}
              className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-brand-primary px-4 py-3 text-xs font-bold text-white shadow-xs hover:bg-brand-primary-hover transition-colors duration-150 cursor-pointer"
            >
              <FaSignature className="w-4 h-4" />
              <span>Create New Signature</span>
            </button>

            <button
              type="button"
              onClick={onAddDateStamp}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-xs font-bold text-neutral-800 hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              <HiCalendar className="w-4 h-4 text-neutral-600" />
              <span>Add Date Stamp</span>
            </button>
          </div>
        </div>

        <hr className="border-neutral-100" />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-neutral-700">
              Placed elements ({placements.length})
            </h3>
            {placements.length > 0 && (
              <button
                type="button"
                onClick={onClearAllPlacements}
                className="text-xs font-bold text-brand-primary hover:text-brand-primary-hover hover:underline cursor-pointer"
              >
                Clear All
              </button>
            )}
          </div>

          {placements.length === 0 ? (
            <div className="text-center py-4 text-xs text-neutral-600 border border-neutral-100 rounded-xl bg-neutral-50/60">
              No signatures placed yet. Click above to add a signature.
            </div>
          ) : (
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {placements.map((p, idx) => (
                <div
                  key={p.id}
                  onClick={() => onSelectPlacement(p.id, p.pageNumber)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-colors duration-150 ${
                    selectedPlacementId === p.id
                      ? "border-neutral-300 bg-neutral-100/70 shadow-2xs"
                      : "border-neutral-200 hover:border-neutral-300 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        selectedPlacementId === p.id
                          ? "bg-brand-primary text-white"
                          : "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div className="truncate">
                      <span className="font-semibold text-neutral-800 block truncate">
                        {p.label ?? "Signature"}
                      </span>
                      <span className="text-[10px] text-neutral-500">
                        Page {p.pageNumber} {p.pageNumber === activePage ? "(Current)" : ""}
                      </span>
                    </div>
                  </div>

                    <div className="flex items-center gap-0.5 relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSidebarDownloadMenuId((prev) => (prev === p.id ? null : p.id));
                      }}
                      aria-label="Download signature"
                      title="Download signature (Transparent or White BG)"
                      className="min-w-[32px] min-h-[32px] flex items-center justify-center text-neutral-600 hover:text-neutral-900 p-1.5 rounded-lg hover:bg-neutral-200/50 transition-colors cursor-pointer"
                    >
                      <HiArrowDownTray className="w-4 h-4" />
                    </button>

                    {sidebarDownloadMenuId === p.id && (
                      <div
                        className="absolute right-0 bottom-full mb-1 w-48 rounded-xl bg-white border border-neutral-200 shadow-md p-1.5 z-30 animate-in fade-in zoom-in-95 duration-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="px-2 py-1 text-xs font-semibold text-neutral-600 border-b border-neutral-100 mb-1">
                          Download Format
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadSignatureImage(
                              p.imageDataUrl,
                              "transparent",
                              p.label ?? "signature"
                            );
                            setSidebarDownloadMenuId(null);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-neutral-800 hover:bg-brand-subtle hover:text-brand-primary flex items-center justify-between cursor-pointer transition-colors"
                        >
                          <span>Transparent PNG</span>
                          <span className="text-xs text-neutral-600 bg-neutral-100 px-1.5 py-0.5 rounded font-medium">Clear</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadSignatureImage(
                              p.imageDataUrl,
                              "white",
                              p.label ?? "signature"
                            );
                            setSidebarDownloadMenuId(null);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-neutral-800 hover:bg-brand-subtle hover:text-brand-primary flex items-center justify-between cursor-pointer transition-colors"
                        >
                          <span>White BG PNG</span>
                          <span className="text-xs text-neutral-600 bg-neutral-100 px-1.5 py-0.5 rounded font-medium">Solid</span>
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePlacement(p.id);
                      }}
                      aria-label="Delete signature stamp"
                      title="Delete stamp"
                      className="min-w-[32px] min-h-[32px] flex items-center justify-center text-neutral-600 hover:text-brand-primary hover:bg-brand-subtle p-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      <HiPlus className="w-4 h-4 rotate-45" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <hr className="border-neutral-100" />

        <div className="space-y-2.5">
          <button
            type="button"
            onClick={onSignPdf}
            disabled={placements.length === 0 || isProcessing}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-primary py-3.5 px-4 text-sm font-bold text-white shadow-sm hover:bg-brand-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 cursor-pointer"
          >
            {isProcessing ? (
              <>
                <HiArrowPath className="w-4 h-4 animate-spin" />
                <span>Embedding Signatures...</span>
              </>
            ) : (
              <>
                <HiShieldCheck className="w-5 h-5" />
                <span>Sign & Download PDF</span>
              </>
            )}
          </button>

          <p className="text-xs text-neutral-600 text-center leading-relaxed">
            All embedding executes locally on your device. Zero server uploads.
          </p>
        </div>
      </div>
    </div>
  );
}
