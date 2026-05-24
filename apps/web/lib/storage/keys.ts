import type { ArtifactId } from '@zili/shared-types';

/**
 * R2 object-key construction. Pure — no I/O — so it is unit-testable.
 *
 * Sprint 1 has no auth, so artifacts are stored unowned at
 * `artifacts/{artifactId}.html`. Sprint 2 introduces the `{userId}` segment
 * (`artifacts/{userId}/{artifactId}.html`, per handoff §4) once a real owner
 * exists; the renderer resolves the key from the DB row at that point.
 */
export const ARTIFACT_KEY_PREFIX = 'artifacts';

export function artifactKey(artifactId: ArtifactId): string {
  return `${ARTIFACT_KEY_PREFIX}/${artifactId}.html`;
}
