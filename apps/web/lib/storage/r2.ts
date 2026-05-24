import { S3Client } from '@aws-sdk/client-s3';
import { ZiliError, Errors } from '../errors';

/**
 * Cloudflare R2 is S3-compatible. We talk to it with the AWS SDK pointed at
 * the R2 endpoint with region 'auto'. Server-only — never import from a
 * Client Component. Credentials come from the env (see .env.example).
 */

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    // Misconfiguration, not user error — surfaced as a 500 via the dictionary.
    throw new ZiliError(Errors.STORAGE_NOT_CONFIGURED);
  }
  return value;
}

export function r2Bucket(): string {
  return requireEnv('R2_BUCKET_NAME');
}

let client: S3Client | undefined;

export function getR2Client(): S3Client {
  if (client) return client;

  const accountId = requireEnv('R2_ACCOUNT_ID');
  client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: requireEnv('R2_ACCESS_KEY_ID'),
      secretAccessKey: requireEnv('R2_SECRET_ACCESS_KEY'),
    },
  });
  return client;
}
