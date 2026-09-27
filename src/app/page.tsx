import { OverviewClient } from "@/components/OverviewClient";
import { currentAiMode, modeDescription } from "@/lib/extractClient";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { loadPermits, snapshotFilePath, sourceManifest, toClientPermit } from "@/lib/loadSnapshot";

import { filtersFromSearchParams, pageSearchParams } from "@/lib/filters";

export default async function HomePage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const initialFilters = filtersFromSearchParams(pageSearchParams(await searchParams));
  const permits = loadPermits();
  const client = permits.map(toClientPermit);
  const neighborhoods = [...new Set(permits.map((p) => p.neighborhood))].sort();
  const snapshotBytes = readFileSync(snapshotFilePath());
  const snapshotHash = createHash("sha256").update(snapshotBytes).digest("hex");
  const manifest = sourceManifest();
  const mode = currentAiMode();

  return (
    <OverviewClient
      key={JSON.stringify(initialFilters)}
      initialFilters={initialFilters}
      records={client}
      neighborhoods={neighborhoods}
      snapshotHash={snapshotHash}
      sourceUpdateDate={manifest.sourceUpdateDate}
      mode={modeDescription(mode)}
      retrievedAt={manifest.retrievalDate}
    />
  );
}
