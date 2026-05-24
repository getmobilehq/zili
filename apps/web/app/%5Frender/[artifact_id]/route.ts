import { asArtifactId } from '@zili/shared-types';
import { assetProxyOrigin, buildArtifactCsp } from '@/lib/render/csp';
import { loadArtifactHtml } from '@/lib/render/source';

// Reads R2 / the filesystem fallback — needs the Node runtime.
export const runtime = 'nodejs';

/**
 * The sandboxed render endpoint: returns raw artifact HTML wrapped in the
 * strict CSP. This is the *content* of the iframe, never framed by anyone but
 * us (frame-ancestors 'self'). The host page (the viewer) supplies the
 * sandbox="allow-scripts" isolation; this response supplies the policy.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ artifact_id: string }> },
): Promise<Response> {
  const { artifact_id } = await params;
  const html = await loadArtifactHtml(asArtifactId(artifact_id));

  if (html === null) {
    return new Response('Artifact not found', {
      status: 404,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
  }

  return new Response(html, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'content-security-policy': buildArtifactCsp({ assetProxyOrigin: assetProxyOrigin() }),
      'x-content-type-options': 'nosniff',
      'cache-control': 'private, no-store',
    },
  });
}
