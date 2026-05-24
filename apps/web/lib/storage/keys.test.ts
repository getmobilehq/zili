import { describe, expect, it } from 'vitest';
import { asArtifactId } from '@zili/shared-types';
import { ARTIFACT_KEY_PREFIX, artifactKey } from './keys';

describe('artifactKey', () => {
  it('builds artifacts/{id}.html', () => {
    expect(artifactKey(asArtifactId('abc-123'))).toBe('artifacts/abc-123.html');
  });

  it('is namespaced under the artifact prefix', () => {
    expect(artifactKey(asArtifactId('x')).startsWith(`${ARTIFACT_KEY_PREFIX}/`)).toBe(true);
  });
});
