/**
 * Asset allow-list logic for the proxy. The pure functions (parseAssetPath,
 * isOriginAllowed) are unit-tested; getAllowlist does the cached I/O.
 */

export type WorkerEnv = {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
};

const ASSET_PREFIX = '/_assets/';

/**
 * Decode `/_assets/{encodedUrl}` into the target URL. Returns null for a
 * malformed path or any non-HTTPS target (we never proxy plaintext).
 */
export function parseAssetPath(pathname: string): URL | null {
  if (!pathname.startsWith(ASSET_PREFIX)) return null;

  const encoded = pathname.slice(ASSET_PREFIX.length);
  if (!encoded) return null;

  try {
    const target = new URL(decodeURIComponent(encoded));
    return target.protocol === 'https:' ? target : null;
  } catch {
    return null;
  }
}

/** A target is allowed only if its exact origin is on the list (no wildcards). */
export function isOriginAllowed(target: URL, allowedOrigins: ReadonlySet<string>): boolean {
  return allowedOrigins.has(target.origin);
}

type CacheEntry = { fetchedAt: number; origins: Set<string> };
const TTL_MS = 5 * 60 * 1000; // 5-minute edge TTL (handoff §4)
let cache: CacheEntry | null = null;

/** Reset the in-memory cache (tests). */
export function resetAllowlistCache(): void {
  cache = null;
}

/**
 * Fetch the allow-listed origins from Supabase (PostgREST), cached for 5
 * minutes. asset_allowlist is public-readable via RLS, so the anon key
 * suffices.
 */
export async function getAllowlist(env: WorkerEnv, now: number = Date.now()): Promise<Set<string>> {
  if (cache && now - cache.fetchedAt < TTL_MS) {
    return cache.origins;
  }

  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/asset_allowlist?select=origin`, {
    headers: {
      apikey: env.SUPABASE_ANON_KEY,
      authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
    },
  });

  if (!response.ok) {
    // Fail closed: if we can't read the list, allow nothing rather than
    // everything. Keep any still-valid cache around for the next request.
    if (cache) return cache.origins;
    return new Set();
  }

  const rows = (await response.json()) as Array<{ origin: string }>;
  const origins = new Set(rows.map((row) => row.origin));
  cache = { fetchedAt: now, origins };
  return origins;
}
