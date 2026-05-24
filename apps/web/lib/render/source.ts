import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { ArtifactId } from '@zili/shared-types';
import { Errors, ZiliError } from '@/lib/errors';
import { getArtifactHtml } from '@/lib/storage/artifacts';

function r2Configured(): boolean {
  return Boolean(process.env.R2_ACCOUNT_ID && process.env.R2_BUCKET_NAME);
}

/**
 * Resolve an artifact's HTML for rendering.
 *
 * Normally this reads from R2. Before R2 credentials exist, a dev/test-only
 * fallback serves `tests/fixtures/{id}.html` so the renderer (and the S1.6
 * visual-regression harness) is verifiable. The fallback is hard-blocked in
 * production — there, missing R2 config is a 500, never a silent local read.
 */
export async function loadArtifactHtml(artifactId: ArtifactId): Promise<string | null> {
  if (r2Configured()) {
    return getArtifactHtml(artifactId);
  }
  if (process.env.NODE_ENV === 'production') {
    throw new ZiliError(Errors.STORAGE_NOT_CONFIGURED);
  }
  return readFixture(artifactId);
}

async function readFixture(artifactId: ArtifactId): Promise<string | null> {
  // basename strips any path traversal from the URL-supplied id.
  const safeName = path.basename(`${artifactId}`);
  const fixturePath = path.join(process.cwd(), '..', '..', 'tests', 'fixtures', `${safeName}.html`);
  try {
    return await fs.readFile(fixturePath, 'utf8');
  } catch {
    return null;
  }
}
