import { describe, expect, it } from 'vitest';
import type { ErrorCode } from '../errors';
import { ZiliError } from '../errors';
import { MAX_UPLOAD_BYTES, looksLikeHtml, validateUpload } from './validate';

/** Run fn and return the ZiliError code it throws, failing otherwise. */
function thrownCode(fn: () => void): ErrorCode {
  try {
    fn();
  } catch (error) {
    if (error instanceof ZiliError) return error.definition.code;
    throw error;
  }
  throw new Error('expected validateUpload to throw');
}

describe('looksLikeHtml', () => {
  it('accepts a declared text/html content type even if the body is opaque', () => {
    expect(looksLikeHtml('whatever', 'text/html; charset=utf-8')).toBe(true);
  });

  it('accepts a doctype', () => {
    expect(looksLikeHtml('<!DOCTYPE html><html></html>')).toBe(true);
  });

  it('accepts a root <html> tag after leading whitespace', () => {
    expect(looksLikeHtml('   \n  <html lang="en">')).toBe(true);
  });

  it('accepts a leading BOM before the doctype', () => {
    expect(looksLikeHtml('﻿<!doctype html>')).toBe(true);
  });

  it('rejects non-HTML content', () => {
    expect(looksLikeHtml('%PDF-1.7 ...')).toBe(false);
    expect(looksLikeHtml('# A markdown file')).toBe(false);
  });
});

describe('validateUpload', () => {
  const html = '<!doctype html><html><body>hi</body></html>';

  it('passes a valid HTML upload', () => {
    expect(() =>
      validateUpload({ content: html, byteLength: html.length, declaredType: 'text/html' }),
    ).not.toThrow();
  });

  it('rejects an empty upload', () => {
    expect(thrownCode(() => validateUpload({ content: '', byteLength: 0 }))).toBe('EMPTY_FILE');
    expect(thrownCode(() => validateUpload({ content: '   \n ', byteLength: 5 }))).toBe(
      'EMPTY_FILE',
    );
  });

  it('rejects a file over the 10MB limit', () => {
    expect(
      thrownCode(() => validateUpload({ content: html, byteLength: MAX_UPLOAD_BYTES + 1 })),
    ).toBe('FILE_TOO_LARGE');
  });

  it('rejects non-HTML content', () => {
    expect(thrownCode(() => validateUpload({ content: '%PDF-1.7', byteLength: 8 }))).toBe(
      'INVALID_FILE_TYPE',
    );
  });
});
