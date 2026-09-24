import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "@/components/ui/sonner";
import { validatePdfFile } from "@/lib/pdf/validation";
import { extractPdfMetadata } from "@/lib/pdf/metadata";
import { renderDocumentThumbnailsBatch, releasePdfDocument } from "@/lib/pdf/render";
import { formatPageRange, safeParsePageRange } from "@/lib/pdf/range";

export interface PageItem {
  number: number;
  selected: boolean;
  thumbnailUrl?: string;
}

interface UsePageSelectionReturn {
  hasFile: boolean;
  fileName: string;
  fileSize: number;
  fileBuffer: ArrayBuffer | null;
  pages: PageItem[];
  rangeInput: string;
  selectedCount: number;
  setPages: React.Dispatch<React.SetStateAction<PageItem[]>>;
  togglePage: (pageNumber: number) => void;
  selectAll: () => void;
  clearSelection: () => void;
  handleRangeInputChange: (value: string) => void;
  handleFilesSelected: (files: FileList) => Promise<void>;
  handleReset: () => void;
}

export function usePageSelection(defaultSelected = false): UsePageSelectionReturn {
  const [hasFile, setHasFile] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [rangeInput, setRangeInput] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const updateRangeString = (updatedPages: PageItem[]) => {
    const selectedNums = updatedPages
      .filter((p) => p.selected)
      .map((p) => p.number);
    setRangeInput(formatPageRange(selectedNums));
  };

  const togglePage = useCallback((pageNumber: number) => {
    setPages((prev) => {
      const updated = prev.map((p) =>
        p.number === pageNumber ? { ...p, selected: !p.selected } : p
      );
      updateRangeString(updated);
      return updated;
    });
  }, []);

  const selectAll = useCallback(() => {
    setPages((prev) => {
      const updated = prev.map((p) => ({ ...p, selected: true }));
      updateRangeString(updated);
      return updated;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setPages((prev) => prev.map((p) => ({ ...p, selected: false })));
    setRangeInput("");
  }, []);

  const handleRangeInputChange = useCallback((value: string) => {
    setRangeInput(value);
    if (!value.trim()) {
      setPages((prev) => prev.map((p) => ({ ...p, selected: false })));
      return;
    }

    setPages((prev) => {
      const parseRes = safeParsePageRange(value, prev.length);
      if (parseRes.isValid) {
        const selectedSet = new Set(parseRes.pages);
        return prev.map((p) => ({
          ...p,
          selected: selectedSet.has(p.number),
        }));
      }
      return prev;
    });
  }, []);

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

      const initialPages: PageItem[] = Array.from(
        { length: metadata.pageCount },
        (_, i) => ({
          number: i + 1,
          selected: defaultSelected,
        })
      );

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setFileName(file.name);
      setFileSize(metadata.size);
      setFileBuffer(buffer);
      setPages(initialPages);
      if (defaultSelected) {
        setRangeInput(formatPageRange(initialPages.map((p) => p.number)));
      } else {
        setRangeInput("");
      }
      setHasFile(true);

      const pageNumbers = Array.from({ length: metadata.pageCount }, (_, i) => i + 1);
      void renderDocumentThumbnailsBatch(
        buffer,
        pageNumbers,
        { width: 120, height: 160 },
        (batch) => {
          if (controller.signal.aborted) return;
          setPages((currentPages) =>
            currentPages.map((item) => {
              const thumb = batch[item.number];
              return thumb ? { ...item, thumbnailUrl: thumb } : item;
            })
          );
        },
        12,
        controller.signal
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to read PDF.";
      toast.error(msg);
    }
  };

  const handleReset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    if (fileBuffer) void releasePdfDocument(fileBuffer);
    setHasFile(false);
    setFileName("");
    setFileSize(0);
    setFileBuffer(null);
    setPages([]);
    setRangeInput("");
  }, [fileBuffer]);

  const selectedCount = pages.filter((p) => p.selected).length;

  return {
    hasFile,
    fileName,
    fileSize,
    fileBuffer,
    pages,
    rangeInput,
    selectedCount,
    setPages,
    togglePage,
    selectAll,
    clearSelection,
    handleRangeInputChange,
    handleFilesSelected,
    handleReset,
  };
}
