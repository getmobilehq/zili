import { Errors, ZiliError } from '../errors';

/** Max upload size — 10MB (Gherkin Feature 2). */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

/**
 * Heuristic HTML check. We accept a declared `text/html` content type, or
 * content that begins with an HTML doctype / root tag once leading whitespace
 * and a BOM are stripped. Deliberately lenient on the markup (LLM output is
 * messy) but strict that it is *some* HTML and not a PDF/image/doc export.
 */
export function looksLikeHtml(content: string, declaredType?: string | null): boolean {
  if (declaredType && declaredType.toLowerCase().includes('text/html')) return true;

  const head = content.replace(/^﻿/, '').trimStart().slice(0, 200).toLowerCase();
  return head.startsWith('<!doctype html') || head.startsWith('<html') || head.includes('<html');
}

export type UploadCandidate = {
  byteLength: number;
  content: string;
  declaredType?: string | null;
};

/** Validate an upload, throwing the appropriate ZiliError on failure. */
export function validateUpload({ byteLength, content, declaredType }: UploadCandidate): void {
  if (byteLength === 0 || content.trim().length === 0) {
    throw new ZiliError(Errors.EMPTY_FILE);
  }
  if (byteLength > MAX_UPLOAD_BYTES) {
    throw new ZiliError(Errors.FILE_TOO_LARGE);
  }
  if (!looksLikeHtml(content, declaredType)) {
    throw new ZiliError(Errors.INVALID_FILE_TYPE);
  }
}
