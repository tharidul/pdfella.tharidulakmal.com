"use client";

import { useState } from "react";
import { toast } from "@/components/ui/sonner";
import { downloadSignatureImage, type SignaturePlacement } from "@/lib/pdf/sign";

export function useSignaturePlacements() {
  const [placements, setPlacements] = useState<SignaturePlacement[]>([]);
  const [selectedPlacementId, setSelectedPlacementId] = useState<string | null>(null);

  const addSignaturePlacement = (
    dataUrl: string,
    label: string,
    activePage: number,
    containerRef: React.RefObject<HTMLDivElement | null>,
    hasFile: boolean
  ) => {
    if (!hasFile) {
      downloadSignatureImage(dataUrl, "transparent", label || "signature");
      toast.success(
        "Signature downloaded as Transparent PNG! Upload a PDF to place and stamp it onto document pages."
      );
      return;
    }

    const img = new window.Image();
    img.onload = () => {
      const naturalW = img.naturalWidth || 300;
      const naturalH = img.naturalHeight || 100;
      const imageAspect = naturalW / naturalH;

      const container = containerRef.current;
      const pageAspect = container
        ? container.clientWidth / (container.clientHeight || 1)
        : 0.707;

      const widthPercent = 28;
      const heightPercent = Math.max(3, (widthPercent * pageAspect) / imageAspect);

      const newPlacement: SignaturePlacement = {
        id: `sig-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        pageNumber: activePage,
        xPercent: 35,
        yPercent: Math.min(85, 70),
        widthPercent,
        heightPercent,
        imageDataUrl: dataUrl,
        aspectRatio: imageAspect,
        label,
      };

      setPlacements((prev) => [...prev, newPlacement]);
      setSelectedPlacementId(newPlacement.id);
    };
    img.src = dataUrl;
  };

  const addDateStamp = (
    activePage: number,
    containerRef: React.RefObject<HTMLDivElement | null>
  ) => {
    const offscreen = document.createElement("canvas");
    offscreen.width = 440;
    offscreen.height = 80;
    const ctx = offscreen.getContext("2d");
    if (!ctx) return;

    const formattedDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    ctx.font = "bold 32px Inter, system-ui, sans-serif";
    ctx.fillStyle = "#1e293b";
    ctx.textBaseline = "middle";
    ctx.fillText(`Date: ${formattedDate}`, 10, 40);

    const dataUrl = offscreen.toDataURL("image/png");
    const imageAspect = 440 / 80;

    const container = containerRef.current;
    const pageAspect = container
      ? container.clientWidth / (container.clientHeight || 1)
      : 0.707;

    const widthPercent = 22;
    const heightPercent = Math.max(2.5, (widthPercent * pageAspect) / imageAspect);

    const newPlacement: SignaturePlacement = {
      id: `date-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      pageNumber: activePage,
      xPercent: 55,
      yPercent: 75,
      widthPercent,
      heightPercent,
      imageDataUrl: dataUrl,
      aspectRatio: imageAspect,
      label: `Date (${formattedDate})`,
    };

    setPlacements((prev) => [...prev, newPlacement]);
    setSelectedPlacementId(newPlacement.id);
    toast.success("Date stamp added.");
  };

  const updatePlacement = (
    id: string,
    updates: Partial<Pick<SignaturePlacement, "xPercent" | "yPercent" | "widthPercent" | "heightPercent">>
  ) => {
    setPlacements((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deletePlacement = (id: string) => {
    setPlacements((prev) => prev.filter((p) => p.id !== id));
    if (selectedPlacementId === id) setSelectedPlacementId(null);
    toast.info("Signature removed from page.");
  };

  const clearPlacements = () => {
    setPlacements([]);
    setSelectedPlacementId(null);
  };

  return {
    placements,
    setPlacements,
    selectedPlacementId,
    setSelectedPlacementId,
    addSignaturePlacement,
    addDateStamp,
    updatePlacement,
    deletePlacement,
    clearPlacements,
  };
}
