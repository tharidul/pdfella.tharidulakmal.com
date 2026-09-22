import type { ValidationResult } from "./types";

export const MAX_PDF_FILE_SIZE_BYTES = 200 * 1024 * 1024;

const DANGEROUS_EXTENSIONS = new Set([
  "exe",
  "bat",
  "cmd",
  "vbs",
  "sh",
  "bash",
  "ps1",
  "msi",
  "scr",
  "pif",
  "com",
  "jar",
  "apk",
  "app",
  "bin",
  "reg",
  "wsf",
  "cpl",
  "gadget",
  "action",
  "workflow",
]);

export interface SavingsResult {
  originalBytes: number;
  compressedBytes: number;
  savedBytes: number;
  savingsPercentage: number;
  formattedOriginal: string;
  formattedCompressed: string;
  formattedSaved: string;
}

export function calculateSavings(
  originalBytes: number,
  compressedBytes: number
): SavingsResult {
  const safeOriginal = Math.max(0, originalBytes);
  const safeCompressed = Math.max(0, compressedBytes);
  const savedBytes = Math.max(0, safeOriginal - safeCompressed);
  const savingsPercentage =
    safeOriginal > 0 ? Math.round((savedBytes / safeOriginal) * 100) : 0;

  return {
    originalBytes: safeOriginal,
    compressedBytes: safeCompressed,
    savedBytes,
    savingsPercentage,
    formattedOriginal: formatFileSize(safeOriginal),
    formattedCompressed: formatFileSize(safeCompressed),
    formattedSaved: formatFileSize(savedBytes),
  };
}

export function formatFileSize(bytes: number): string {
  if (bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const size = bytes / Math.pow(1024, i);
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  if (lastDot === -1 || lastDot === filename.length - 1) return "";
  return filename.slice(lastDot + 1).toLowerCase().trim();
}

export function hasDangerousExtension(filename: string): boolean {
  const parts = filename.toLowerCase().split(".");
  if (parts.length <= 1) return false;
  const lastExt = parts[parts.length - 1] ?? "";
  if (DANGEROUS_EXTENSIONS.has(lastExt)) return true;
  return parts.slice(1).some((ext) => DANGEROUS_EXTENSIONS.has(ext));
}

export function hasPdfMagicBytes(bytes: Uint8Array): boolean {
  if (bytes.length < 4) return false;

  const searchLimit = Math.min(bytes.length - 4, 1024);
  const p = 0x25; 
  const d = 0x50; 
  const f = 0x44; 
  const f2 = 0x46; 

  for (let i = 0; i <= searchLimit; i++) {
    if (
      bytes[i] === p &&
      bytes[i + 1] === d &&
      bytes[i + 2] === f &&
      bytes[i + 3] === f2
    ) {
      return true;
    }
  }

  return false;
}

export function sanitizeFilename(filename: string, fallback = "document.pdf"): string {
  if (!filename || typeof filename !== "string") {
    return fallback;
  }

  let clean = filename.replace(/(\.\.[\/\\])+/g, "");

  clean = clean.replace(/[\x00-\x1F\x7F<>:"/\\|?*]/g, "_");

  clean = clean.replace(/[\s_]+/g, "_");

  clean = clean.replace(/^[\s._]+|[\s._]+$/g, "");

  if (!clean || clean.length === 0) {
    return fallback;
  }

  if (clean.length > 200) {
    const ext = getFileExtension(clean);
    const base = ext ? clean.slice(0, 195 - ext.length) : clean.slice(0, 200);
    clean = ext ? `${base}.${ext}` : base;
  }

  const fallbackExt = getFileExtension(fallback) || "pdf";
  const currentExt = getFileExtension(clean);
  if (!currentExt) {
    clean = `${clean}.${fallbackExt}`;
  }

  return clean;
}

export function validatePdfBuffer(
  buffer: ArrayBuffer | Uint8Array,
  filename?: string
): ValidationResult {
  const byteLength = buffer.byteLength;

  if (byteLength === 0) {
    return {
      isValid: false,
      error: "The file is empty (0 bytes).",
    };
  }

  if (byteLength > MAX_PDF_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      error: `File size (${formatFileSize(byteLength)}) exceeds the maximum allowed limit of 200 MB.`,
    };
  }

  if (filename && hasDangerousExtension(filename)) {
    return {
      isValid: false,
      error: `The file "${filename}" has a disallowed or dangerous file extension.`,
    };
  }

  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  if (!hasPdfMagicBytes(bytes)) {
    return {
      isValid: false,
      error: "The file does not contain a valid PDF signature (%PDF header).",
    };
  }

  return { isValid: true };
}

export async function validatePdfFile(file: File): Promise<ValidationResult> {
  if (!file) {
    return {
      isValid: false,
      error: "No file provided.",
    };
  }

  if (hasDangerousExtension(file.name)) {
    return {
      isValid: false,
      error: `The file "${file.name}" has an unsupported or dangerous extension.`,
    };
  }

  if (file.size === 0) {
    return {
      isValid: false,
      error: `The file "${file.name}" is empty (0 bytes).`,
    };
  }

  if (file.size > MAX_PDF_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      error: `File "${file.name}" (${formatFileSize(file.size)}) exceeds the maximum allowed limit of 200 MB.`,
    };
  }

  try {
    const headerBlob = file.slice(0, 1024);
    const headerBuffer = await headerBlob.arrayBuffer();
    const bytes = new Uint8Array(headerBuffer);

    if (!hasPdfMagicBytes(bytes)) {
      return {
        isValid: false,
        error: `"${file.name}" is not a valid PDF file. Missing %PDF binary header.`,
      };
    }

    return { isValid: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown file reading error";
    return {
      isValid: false,
      error: `Failed to read file header: ${message}`,
    };
  }
}
