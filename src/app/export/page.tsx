import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ExportClient } from "@/components/ExportClient";
import { currentAiMode, modeDescription } from "@/lib/extractClient";
import { loadPermits, sourceManifest, toClientPermit } from "@/lib/loadSnapshot";

export default function ExportPage() {
  const permits = loadPermits().map(toClientPermit);
  const snapshotBytes = readFileSync(join(process.cwd(), "data/public/permits-2025.json"));
  const snapshotHash = createHash("sha256").update(snapshotBytes).digest("hex");
  const manifest = sourceManifest();
  return (
    <ExportClient
      records={permits}
      snapshotHash={snapshotHash}
      sourceUpdateDate={manifest.sourceUpdateDate}
      mode={modeDescription(currentAiMode())}
      snapshotDate={manifest.retrievalDate}
    />
  );
}
