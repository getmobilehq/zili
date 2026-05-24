import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { ArtifactId } from '@zili/shared-types';
import { artifactKey } from './keys';
import { getR2Client, r2Bucket } from './r2';

const HTML_CONTENT_TYPE = 'text/html; charset=utf-8';
const UPLOAD_URL_TTL_SECONDS = 600; // 10 minutes
const READ_URL_TTL_SECONDS = 300; // 5 minutes

/** Store raw artifact HTML in R2. Returns the object key it was written to. */
export async function putArtifactHtml(artifactId: ArtifactId, html: string): Promise<string> {
  const key = artifactKey(artifactId);
  await getR2Client().send(
    new PutObjectCommand({
      Bucket: r2Bucket(),
      Key: key,
      Body: html,
      ContentType: HTML_CONTENT_TYPE,
    }),
  );
  return key;
}

/**
 * Presigned PUT URL for direct browser-to-R2 upload (the "signed-upload"
 * pipeline). The server-side POST route is the path exercised in Sprint 1;
 * this helper is here for the Sprint 2 drag-drop UI.
 */
export function createArtifactUploadUrl(artifactId: ArtifactId): Promise<string> {
  return getSignedUrl(
    getR2Client(),
    new PutObjectCommand({
      Bucket: r2Bucket(),
      Key: artifactKey(artifactId),
      ContentType: HTML_CONTENT_TYPE,
    }),
    { expiresIn: UPLOAD_URL_TTL_SECONDS },
  );
}

/** Presigned GET URL for reading an artifact back from R2. */
export function createArtifactReadUrl(artifactId: ArtifactId): Promise<string> {
  return getSignedUrl(
    getR2Client(),
    new GetObjectCommand({ Bucket: r2Bucket(), Key: artifactKey(artifactId) }),
    { expiresIn: READ_URL_TTL_SECONDS },
  );
}

/** Fetch artifact HTML from R2, or null if it does not exist. Used by the renderer (S1.4). */
export async function getArtifactHtml(artifactId: ArtifactId): Promise<string | null> {
  try {
    const result = await getR2Client().send(
      new GetObjectCommand({ Bucket: r2Bucket(), Key: artifactKey(artifactId) }),
    );
    return (await result.Body?.transformToString()) ?? null;
  } catch (error) {
    if (error instanceof Error && error.name === 'NoSuchKey') return null;
    throw error;
  }
}
