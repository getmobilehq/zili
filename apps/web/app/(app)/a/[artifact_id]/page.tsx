/**
 * Minimal artifact viewer (Sprint 1). Embeds the render endpoint in a
 * sandboxed iframe: `allow-scripts` only — deliberately NO `allow-same-origin`,
 * so the artifact runs as an opaque origin and cannot touch the parent, cookies,
 * or storage (handoff §4; never weaken this). Presenter chrome arrives in S3.
 *
 * Lives in the (app) group whose layout is an unauthenticated stub in S1; the
 * auth gate is added there in S2.
 */
export default async function ArtifactViewerPage({
  params,
}: {
  params: Promise<{ artifact_id: string }>;
}) {
  const { artifact_id } = await params;

  return (
    <main className="h-screen w-screen bg-paper">
      <iframe
        title="Artifact"
        src={`/_render/${artifact_id}`}
        sandbox="allow-scripts"
        className="h-full w-full border-0"
      />
    </main>
  );
}
