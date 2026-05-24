/**
 * Central error dictionary (SK-04). User-facing error copy lives here, never
 * inline at the throw site. Each error carries a stable code, display copy,
 * a one-click recovery action, and an HTTP status. The API maps ZiliError to
 * the response shape `{ error: { code, message } }`; the frontend looks copy
 * up by code. Tone: honest, specific, not apologetic — no "Oops", no emoji.
 */

export type ErrorCode =
  | 'EMPTY_FILE'
  | 'FILE_TOO_LARGE'
  | 'INVALID_FILE_TYPE'
  | 'STORAGE_NOT_CONFIGURED'
  | 'UPLOAD_FAILED';

export type ErrorDefinition = {
  code: ErrorCode;
  title: string;
  body: string;
  suggestedAction: string;
  httpStatus: number;
};

export const Errors: Record<ErrorCode, ErrorDefinition> = {
  EMPTY_FILE: {
    code: 'EMPTY_FILE',
    title: 'That file is empty.',
    body: 'The upload contained no content. Pick the HTML file your LLM produced and try again.',
    suggestedAction: 'Choose a file',
    httpStatus: 400,
  },
  FILE_TOO_LARGE: {
    code: 'FILE_TOO_LARGE',
    title: 'That file is over 10MB.',
    body: 'Zili accepts HTML files up to 10MB. Most LLM artifacts are well under this — yours is probably bundled with images or a large CSS file. Try uploading the HTML alone.',
    suggestedAction: 'Try another file',
    httpStatus: 413,
  },
  INVALID_FILE_TYPE: {
    code: 'INVALID_FILE_TYPE',
    title: "That doesn't look like HTML.",
    body: 'Zili presents HTML artifacts. Upload the .html file your LLM generated — not a PDF, image, or document export.',
    suggestedAction: 'Try another file',
    httpStatus: 415,
  },
  STORAGE_NOT_CONFIGURED: {
    code: 'STORAGE_NOT_CONFIGURED',
    title: 'Storage is not configured.',
    body: 'Object storage credentials are missing on the server. This is a configuration issue, not something you did.',
    suggestedAction: 'Contact support',
    httpStatus: 500,
  },
  UPLOAD_FAILED: {
    code: 'UPLOAD_FAILED',
    title: "We couldn't store that artifact.",
    body: 'Something went wrong saving your file. This is on us — please try again in a moment.',
    suggestedAction: 'Try again',
    httpStatus: 500,
  },
};

/** Thrown anywhere a known, user-surfaceable error condition occurs. */
export class ZiliError extends Error {
  readonly definition: ErrorDefinition;

  constructor(definition: ErrorDefinition) {
    super(definition.code);
    this.name = 'ZiliError';
    this.definition = definition;
  }
}

/** API response shape for an error: `{ error: { code, message } }`. */
export function errorResponse(error: ZiliError): Response {
  const { code, title, httpStatus } = error.definition;
  return Response.json({ error: { code, message: title } }, { status: httpStatus });
}
