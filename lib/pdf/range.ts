import type { PageRangeParseResult } from "./types";

export function parsePageRange(input: string, totalPages: number): number[] {
  if (totalPages <= 0 || !Number.isInteger(totalPages)) {
    throw new Error(`Invalid total page count: ${totalPages}. Must be a positive integer.`);
  }

  if (typeof input !== "string") {
    throw new Error("Page range input must be a string.");
  }

  const trimmed = input.trim();
  if (trimmed.length === 0) {
    throw new Error("Page range cannot be empty.");
  }

  const tokens = trimmed.split(",");
  const pageSet = new Set<number>();

  for (let i = 0; i < tokens.length; i++) {
    const rawToken = tokens[i];
    if (rawToken === undefined) continue;

    const token = rawToken.trim();

    if (token.length === 0) {
      throw new Error(`Malformed page range: empty segment detected near comma #${i + 1}.`);
    }

    if (token.includes("-")) {
      const dashParts = token.split("-");
      if (dashParts.length !== 2) {
        throw new Error(`Malformed page range syntax: "${token}". Only single dashes (e.g. "1-5") are supported.`);
      }

      const [startStr, endStr] = dashParts;
      if (startStr === undefined || endStr === undefined) {
        throw new Error(`Malformed range: "${token}".`);
      }

      const startTrimmed = startStr.trim();
      const endTrimmed = endStr.trim();

      if (!/^\d+$/.test(startTrimmed) || !/^\d+$/.test(endTrimmed)) {
        throw new Error(`Malformed range syntax: "${token}". Range bounds must be positive numbers.`);
      }

      const start = Number(startTrimmed);
      const end = Number(endTrimmed);

      if (start === 0 || end === 0) {
        throw new Error(`Invalid page number 0 in range "${token}". Pages are 1-indexed.`);
      }

      if (start > totalPages) {
        throw new Error(`Page ${start} exceeds total page count of ${totalPages}.`);
      }

      if (end > totalPages) {
        throw new Error(`Page ${end} exceeds total page count of ${totalPages}.`);
      }

      const min = Math.min(start, end);
      const max = Math.max(start, end);

      for (let p = min; p <= max; p++) {
        pageSet.add(p);
      }
    } else {
      if (!/^\d+$/.test(token)) {
        throw new Error(`Invalid page number or token: "${token}". Expected a positive number.`);
      }

      const page = Number(token);

      if (page === 0) {
        throw new Error("Invalid page number 0. Pages are 1-indexed.");
      }

      if (page > totalPages) {
        throw new Error(`Page ${page} exceeds total page count of ${totalPages}.`);
      }

      pageSet.add(page);
    }
  }

  if (pageSet.size === 0) {
    throw new Error("No valid pages selected.");
  }

  return Array.from(pageSet).sort((a, b) => a - b);
}

export function safeParsePageRange(input: string, totalPages: number): PageRangeParseResult {
  try {
    const pages = parsePageRange(input, totalPages);
    return {
      isValid: true,
      pages,
    };
  } catch (err) {
    return {
      isValid: false,
      error: err instanceof Error ? err.message : "Invalid page range",
      pages: [],
    };
  }
}

export function formatPageRange(pages: number[]): string {
  if (!pages || pages.length === 0) {
    return "";
  }

  const sorted = Array.from(new Set(pages))
    .filter((p) => p > 0 && Number.isInteger(p))
    .sort((a, b) => a - b);

  if (sorted.length === 0) return "";

  const ranges: string[] = [];
  let start = sorted[0];
  let prev = sorted[0];

  if (start === undefined || prev === undefined) return "";

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    if (current === undefined) continue;

    if (current === prev + 1) {
      prev = current;
    } else {
      ranges.push(start === prev ? `${start}` : `${start}-${prev}`);
      start = current;
      prev = current;
    }
  }

  ranges.push(start === prev ? `${start}` : `${start}-${prev}`);
  return ranges.join(", ");
}
