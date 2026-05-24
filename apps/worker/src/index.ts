import { getAllowlist, isOriginAllowed, parseAssetPath, type WorkerEnv } from './allowlist';

/**
 * Zili asset proxy. Artifacts reference external assets through
 * `/_assets/{encodedUrl}`; this Worker decodes the target, checks its origin
 * against the allow-list, and proxies it. Anything not explicitly allowed is
 * refused — the renderer CSP only trusts this origin, so a blocked asset
 * simply doesn't load. Deploy is deferred until the Cloudflare account exists.
 */
export default {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method not allowed', { status: 405 });
    }

    const target = parseAssetPath(new URL(request.url).pathname);
    if (!target) {
      return new Response('Bad asset request', { status: 400 });
    }

    const allowed = await getAllowlist(env);
    if (!isOriginAllowed(target, allowed)) {
      return new Response(`Origin not allow-listed: ${target.origin}`, { status: 403 });
    }

    const upstream = await fetch(target.href, {
      method: request.method,
      headers: { accept: request.headers.get('accept') ?? '*/*' },
      redirect: 'follow',
    });

    // Re-emit with edge-friendly caching; strip upstream cookies.
    const headers = new Headers();
    const contentType = upstream.headers.get('content-type');
    if (contentType) headers.set('content-type', contentType);
    headers.set('cache-control', 'public, max-age=86400, immutable');
    headers.set('x-content-type-options', 'nosniff');

    return new Response(upstream.body, { status: upstream.status, headers });
  },
};
