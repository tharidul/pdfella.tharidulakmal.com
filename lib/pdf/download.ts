import { sanitizeFilename } from "./validation";

export function downloadFile(
  data: Uint8Array | ArrayBuffer | Blob,
  filename: string,
  mimeType = "application/octet-stream",
  fallbackFilename = "download"
): void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("Download utility can only be executed in a browser environment.");
  }

  const safeFilename = sanitizeFilename(filename, fallbackFilename);

  let blob: Blob;
  if (data instanceof Blob) {
    blob = data;
  } else {
    const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
    const arrayBuffer =
      bytes.byteOffset === 0 && bytes.byteLength === bytes.buffer.byteLength
        ? bytes.buffer
        : bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
    blob = new Blob([arrayBuffer as ArrayBuffer], { type: mimeType });
  }

  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = safeFilename;
  anchor.style.display = "none";

  document.body.appendChild(anchor);

  try {
    anchor.click();
  } finally {
    document.body.removeChild(anchor);
    setTimeout(() => {
      URL.revokeObjectURL(objectUrl);
    }, 1000);
  }
}

export function downloadPdf(
  data: Uint8Array | ArrayBuffer | Blob,
  filename: string,
  fallbackFilename = "document.pdf"
): void {
  downloadFile(data, filename, "application/pdf", fallbackFilename);
}

export const triggerDownload = downloadFile;
