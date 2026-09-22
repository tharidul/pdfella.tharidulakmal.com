
export interface ValidationSuccess {
  isValid: true;
}

export interface ValidationFailure {
  isValid: false;
  error: string;
}

export type ValidationResult = ValidationSuccess | ValidationFailure;

export interface PdfDocumentMetadata {
  name: string;
  size: number;
  formattedSize: string;
  pageCount: number;
  title?: string;
  author?: string;
  creator?: string;
  producer?: string;
  creationDate?: Date;
  modificationDate?: Date;
}

export interface PageRangeParseSuccess {
  isValid: true;
  pages: number[];
}

export interface PageRangeParseFailure {
  isValid: false;
  error: string;
  pages: [];
}

export type PageRangeParseResult = PageRangeParseSuccess | PageRangeParseFailure;

export type ProcessingStatus = "idle" | "loading" | "processing" | "success" | "error";

export interface ProcessingState {
  status: ProcessingStatus;
  progress?: number;
  message?: string;
  error?: string;
}

export interface PageThumbnailOptions {
  scale?: number;
  width?: number;
  height?: number;
  quality?: number;
}
