import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  getAllowlist,
  isOriginAllowed,
  parseAssetPath,
  resetAllowlistCache,
  type WorkerEnv,
} from './allowlist';

describe('parseAssetPath', () => {
  it('decodes an https target under /_assets/', () => {
    const encoded = encodeURIComponent('https://fonts.googleapis.com/css2?family=Inter');
    const target = parseAssetPath(`/_assets/${encoded}`);
    expect(target?.origin).toBe('https://fonts.googleapis.com');
  });

  it('rejects non-https targets', () => {
    const encoded = encodeURIComponent('http://insecure.example.com/x.css');
    expect(parseAssetPath(`/_assets/${encoded}`)).toBeNull();
  });

  it('rejects paths outside /_assets/ and empty targets', () => {
    expect(parseAssetPath('/something-else')).toBeNull();
    expect(parseAssetPath('/_assets/')).toBeNull();
  });

  it('rejects garbage that is not a URL', () => {
    expect(parseAssetPath('/_assets/not%20a%20url')).toBeNull();
  });
});

describe('isOriginAllowed', () => {
  const allowed = new Set(['https://fonts.googleapis.com', 'https://cdn.jsdelivr.net']);

  it('allows an exact origin match', () => {
    expect(isOriginAllowed(new URL('https://cdn.jsdelivr.net/npm/x'), allowed)).toBe(true);
  });

  it('denies origins not on the list', () => {
    expect(isOriginAllowed(new URL('https://evil.example.com/x'), allowed)).toBe(false);
  });

  it('does not allow subdomains of allowed origins (no wildcards)', () => {
    expect(isOriginAllowed(new URL('https://sneaky.fonts.googleapis.com/x'), allowed)).toBe(false);
  });
});

describe('getAllowlist', () => {
  const env: WorkerEnv = { SUPABASE_URL: 'https://x.supabase.co', SUPABASE_ANON_KEY: 'anon' };

  afterEach(() => {
    resetAllowlistCache();
    vi.restoreAllMocks();
  });

  it('fetches, builds a set, and caches within the TTL', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        new Response(JSON.stringify([{ origin: 'https://cdn.tailwindcss.com' }]), { status: 200 }),
      );

    const first = await getAllowlist(env, 1_000);
    expect(first.has('https://cdn.tailwindcss.com')).toBe(true);

    // Within TTL: served from cache, no second fetch.
    await getAllowlist(env, 2_000);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('fails closed (empty set) when the list cannot be read', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('nope', { status: 500 }));
    const origins = await getAllowlist(env, 1_000);
    expect(origins.size).toBe(0);
  });
});
