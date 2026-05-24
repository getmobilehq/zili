/**
 * Content-Security-Policy for the artifact renderer (handoff §4).
 *
 * The renderer is the highest-risk surface: untrusted user HTML runs inside a
 * sandboxed iframe. The policy starts from `default-src 'none'` and only opens
 * what artifacts genuinely need — inline script/style (LLM output inlines
 * everything) and assets routed through our proxy origin. Nothing here may be
 * loosened without review (handoff §3). `connect-src 'none'` means the artifact
 * cannot phone home.
 *
 * Pure — no I/O — so it is unit-testable.
 */

export type CspOptions = {
  /** Origin of the Cloudflare asset proxy (e.g. https://assets.zili.xyz). */
  assetProxyOrigin?: string | null;
};

/** Join non-empty sources, collapsing to 'none' when the list is empty. */
function sources(...tokens: (string | null | undefined)[]): string {
  const present = tokens.filter((t): t is string => Boolean(t && t.trim()));
  return present.length > 0 ? present.join(' ') : "'none'";
}

export function buildArtifactCsp({ assetProxyOrigin }: CspOptions = {}): string {
  const asset = assetProxyOrigin?.trim() || null;

  const directives: Record<string, string> = {
    'default-src': "'none'",
    'script-src': sources("'unsafe-inline'", "'unsafe-eval'", asset),
    'style-src': sources("'unsafe-inline'", asset),
    'img-src': sources('data:', asset),
    'font-src': sources(asset),
    'connect-src': "'none'",
    // Hardening (only tightens): restrict who can frame the raw endpoint, and
    // block <base>/form submissions an artifact might use to escape the frame.
    'frame-ancestors': "'self'",
    'base-uri': "'none'",
    'form-action': "'none'",
  };

  return (
    Object.entries(directives)
      .map(([directive, value]) => `${directive} ${value}`)
      .join('; ') + ';'
  );
}

/** Asset-proxy origin from the environment, or null when not yet deployed. */
export function assetProxyOrigin(): string | null {
  return process.env.ASSET_PROXY_URL?.trim() || null;
}
