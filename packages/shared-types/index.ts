/**
 * Shared types between the web app and the Cloudflare worker.
 *
 * Branded IDs (handoff §6): a `UserId` cannot be passed where an `ArtifactId`
 * is expected, even though both are strings at runtime. Construct them at the
 * trust boundary (DB reads, route params) via the `as*` helpers.
 */

export type Brand<T, B extends string> = T & { readonly __brand: B };

export type UserId = Brand<string, 'UserId'>;
export type ArtifactId = Brand<string, 'ArtifactId'>;
export type ShareLinkId = Brand<string, 'ShareLinkId'>;

export const asUserId = (value: string): UserId => value as UserId;
export const asArtifactId = (value: string): ArtifactId => value as ArtifactId;
export const asShareLinkId = (value: string): ShareLinkId => value as ShareLinkId;

/** Closed sets — mirror the Postgres enums of the same name (handoff §8). */
export type PlanState = 'free' | 'grandfather_eligible' | 'grandfather_locked' | 'pro';
export type ArtifactMode = 'slides' | 'document';
