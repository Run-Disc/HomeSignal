import { Suspense } from "react";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { ExportClient } from "@/components/ExportClient";
import { currentAiMode, modeDescription } from "@/lib/extractClient";
import { loadPermits, snapshotFilePath, sourceManifest, toClientPermit } from "@/lib/loadSnapshot";

export default function ExportPage() {
  const permits = loadPermits().map(toClientPermit);
  const snapshotBytes = readFileSync(snapshotFilePath());
  const snapshotHash = createHash("sha256").update(snapshotBytes).digest("hex");
  const manifest = sourceManifest();
  return (
    <Suspense fallback={<p>Loading briefing…</p>}>
      <ExportClient
        records={permits}
        snapshotHash={snapshotHash}
        sourceUpdateDate={manifest.sourceUpdateDate}
        mode={modeDescription(currentAiMode())}
        snapshotDate={manifest.retrievalDate}
      />
    </Suspense>
  );
}
