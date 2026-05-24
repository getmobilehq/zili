import type { NextRequest } from 'next/server';
import { asArtifactId } from '@zili/shared-types';
import { Errors, ZiliError, errorResponse } from '@/lib/errors';
import { validateUpload } from '@/lib/ingest/validate';
import { putArtifactHtml } from '@/lib/storage/artifacts';

// AWS SDK needs the Node runtime (not Edge).
export const runtime = 'nodejs';

type ParsedUpload = { content: string; byteLength: number; declaredType: string | null };

async function readUpload(req: NextRequest): Promise<ParsedUpload> {
  const contentType = req.headers.get('content-type') ?? '';

  if (contentType.includes('multipart/form-data')) {
    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      throw new ZiliError(Errors.EMPTY_FILE);
    }
    return { content: await file.text(), byteLength: file.size, declaredType: file.type || null };
  }

  // Raw body, e.g. `curl --data-binary @deck.html -H 'Content-Type: text/html'`.
  const content = await req.text();
  return { content, byteLength: Buffer.byteLength(content), declaredType: contentType || null };
}

/**
 * Upload an HTML artifact. Sprint 1 contract: POST an HTML file, get back a
 * render URL. No auth and no DB row yet (no owner) — the renderer resolves the
 * object directly from R2 by id. Ownership + persistence arrive in Sprint 2.
 */
export async function POST(req: NextRequest): Promise<Response> {
  try {
    const { content, byteLength, declaredType } = await readUpload(req);
    validateUpload({ content, byteLength, declaredType });

    const artifactId = asArtifactId(crypto.randomUUID());
    await putArtifactHtml(artifactId, content);

    // Viewer hosts the sandboxed iframe; /_render is the iframe's content src.
    return Response.json({ id: artifactId, url: `/a/${artifactId}` }, { status: 201 });
  } catch (error) {
    if (error instanceof ZiliError) {
      return errorResponse(error);
    }
    // Never swallow — log it. Sentry wiring is pending (account TBD this sprint).
    console.error('[api/upload] unexpected error', error);
    return errorResponse(new ZiliError(Errors.UPLOAD_FAILED));
  }
}
