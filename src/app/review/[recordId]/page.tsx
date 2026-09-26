import { notFound } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { ReviewWorkspace } from "@/components/ReviewWorkspace";
import { SiteFooter } from "@/components/SiteFooter";
import { currentAiMode, modeDescription } from "@/lib/extractClient";
import { loadPermits, sourceManifest, toClientPermit } from "@/lib/loadSnapshot";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ recordId: string }>;
}) {
  const { recordId } = await params;
  const decoded = decodeURIComponent(recordId);
  const permits = loadPermits();
  const idx = permits.findIndex((p) => p.recordId === decoded);
  if (idx < 0) notFound();
  const record = toClientPermit(permits[idx]);
  const candidates = permits.filter((p) => p.candidateDiscovery.selected);
  const cidx = candidates.findIndex((p) => p.recordId === decoded);
  const prev = cidx > 0 ? candidates[cidx - 1].recordId : permits[idx - 1]?.recordId ?? null;
  const next =
    cidx >= 0 && cidx < candidates.length - 1
      ? candidates[cidx + 1].recordId
      : permits[idx + 1]?.recordId ?? null;
  const mode = currentAiMode();
  const manifest = sourceManifest();

  return (
    <div className="shell">
      <AppHeader snapshotDate={manifest.retrievalDate} modeLabel={`AI mode: ${mode}`} />
      <main id="main">
        <ReviewWorkspace
          record={record}
          neighbors={{ prev, next }}
          modeDescription={modeDescription(mode)}
          aiMode={mode}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
