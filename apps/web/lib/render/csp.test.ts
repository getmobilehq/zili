import { describe, expect, it } from 'vitest';
import { buildArtifactCsp } from './csp';

/** Parse a CSP string into a directive -> sources map. */
function parse(csp: string): Record<string, string> {
  return Object.fromEntries(
    csp
      .split(';')
      .map((d) => d.trim())
      .filter(Boolean)
      .map((d) => {
        const [name, ...rest] = d.split(/\s+/);
        return [name, rest.join(' ')];
      }),
  );
}

describe('buildArtifactCsp', () => {
  it('locks the default and forbids network egress', () => {
    const csp = parse(buildArtifactCsp());
    expect(csp['default-src']).toBe("'none'");
    expect(csp['connect-src']).toBe("'none'");
  });

  it('allows inline script/style (LLM artifacts inline everything)', () => {
    const csp = parse(buildArtifactCsp());
    expect(csp['script-src']).toContain("'unsafe-inline'");
    expect(csp['script-src']).toContain("'unsafe-eval'");
    expect(csp['style-src']).toContain("'unsafe-inline'");
  });

  it('permits data: images but no fonts when no asset proxy is configured', () => {
    const csp = parse(buildArtifactCsp());
    expect(csp['img-src']).toContain('data:');
    expect(csp['font-src']).toBe("'none'");
  });

  it('adds the asset proxy origin to script/style/img/font when provided', () => {
    const origin = 'https://assets.zili.xyz';
    const csp = parse(buildArtifactCsp({ assetProxyOrigin: origin }));
    for (const directive of ['script-src', 'style-src', 'img-src', 'font-src']) {
      expect(csp[directive]).toContain(origin);
    }
  });

  it('hardens framing and frame-escape vectors', () => {
    const csp = parse(buildArtifactCsp());
    expect(csp['frame-ancestors']).toBe("'self'");
    expect(csp['base-uri']).toBe("'none'");
    expect(csp['form-action']).toBe("'none'");
  });
});
