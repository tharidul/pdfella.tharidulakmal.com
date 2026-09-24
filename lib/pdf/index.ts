export type {
  ValidationResult,
  ValidationSuccess,
  ValidationFailure,
  PdfDocumentMetadata,
  UpdatePdfMetadataOptions,
  PageRangeParseResult,
  PageRangeParseSuccess,
  PageRangeParseFailure,
  ProcessingStatus,
  ProcessingState,
  PageThumbnailOptions,
} from "./types";

export {
  validatePdfFile,
  validatePdfBuffer,
  formatFileSize,
  sanitizeFilename,
  MAX_PDF_FILE_SIZE_BYTES,
} from "./validation";

export {
  parsePageRange,
  safeParsePageRange,
  formatPageRange,
} from "./range";

export { downloadFile, downloadPdf, triggerDownload } from "./download";
export {
  extractPdfMetadata,
  updatePdfMetadata,
  sanitizePdfMetadata,
  updateMetadataAndDownload,
  sanitizeMetadataAndDownload,
} from "./metadata";
export {
  clearThumbnailCache,
  releasePdfDocument,
  renderPageThumbnail,
  renderDocumentThumbnailsBatch,
} from "./render";

export {
  mergePdfs,
  mergeAndDownloadPdfs,
  getMergedPdfFilename,
  type MergeInputItem,
  type MergeResult,
} from "./merge";

export {
  splitPdf,
  splitAndDownloadPdf,
  getSplitPdfFilename,
  type SplitPdfInput,
  type SplitPdfResult,
} from "./split";

export {
  removePdfPages,
  removeAndDownloadPdfPages,
  getRemovePagesFilename,
  type RemovePagesInput,
  type RemovePagesResult,
} from "./remove";

export {
  organizePdf,
  organizeAndDownloadPdf,
  getOrganizePdfFilename,
  type OrganizePageOrder,
  type OrganizePdfInput,
  type OrganizePdfResult,
} from "./organize";

export {
  compressPdf,
  compressAndDownloadPdf,
  calculateSavings,
  estimateCompressedSize,
  getCompressPdfFilename,
  COMPRESSION_TIER_CONFIGS,
  type CompressionTier,
  type CompressionTierConfig,
  type CompressPdfInput,
  type CompressPdfResult,
  type SavingsResult,
} from "./compress";

export { createZipArchive, type ZipFileEntry } from "./zip";

export {
  convertImagesToPdf,
  convertImagesAndDownload,
  type ImagePageSize,
  type ImageOrientation,
  type ImageMargin,
  type ImageToPdfOptions,
  type ImageItem,
} from "./imageToPdf";

export {
  convertPdfToImagesZip,
  downloadSinglePageImage,
  renderPdfPageToImage,
  type ImageFormat,
  type ImageResolution,
  type PdfToImageOptions,
  type RenderedPageImage,
} from "./pdfToImage";

export {
  addPageNumbersToPdf,
  addPageNumbersAndDownload,
  type PageNumberPosition,
  type PageNumberFormat,
  type PageNumbersOptions,
} from "./pageNumbers";

export {
  addWatermarkToPdf,
  addWatermarkAndDownload,
  type WatermarkType,
  type TextWatermarkOptions,
  type ImageWatermarkOptions,
  type WatermarkOptions,
} from "./watermark";

export {
  signPdf,
  signAndDownloadPdf,
  downloadSignatureImage,
  type SignaturePlacement,
  type SignPdfInput,
} from "./sign";

export { loadPdfLib } from "./loader";
