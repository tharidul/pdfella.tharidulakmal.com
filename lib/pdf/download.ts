import { sanitizeFilename } from "./validation";

/**
 * Client-side utility to trigger a browser file download of generated PDF data.
 *
 * Requirements:
 * - Creates a Blob with type "application/pdf"
 * - Creates an Object URL
 * - Triggers download via simulated click on a detached <a> element
 * - Cleans up and revokes the Object URL afterward
 * - Sanitizes filenames before triggering download
 */
export function downloadPdf(
  data: Uint8Array | ArrayBuffer | Blob,
  filename: string,
  fallbackFilename = "document.pdf"
): void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("downloadPdf can only be executed in a browser environment.");
  }

  const safeFilename = sanitizeFilename(filename, fallbackFilename);

  let blob: Blob;
  if (data instanceof Blob) {
    blob = data;
  } else {
    // Uint8Array or ArrayBuffer
    const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
    // Note: create a copy of the buffer slice if needed, or pass directly to Blob
    blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
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
    // Revoke the object URL after a short timeout so the browser has time to initiate the download stream
    setTimeout(() => {
      URL.revokeObjectURL(objectUrl);
    }, 1000);
  }
}
