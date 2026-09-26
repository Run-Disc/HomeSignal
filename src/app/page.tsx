import { AppHeader } from "@/components/AppHeader";
import { OverviewClient } from "@/components/OverviewClient";
import { SiteFooter } from "@/components/SiteFooter";
import { currentAiMode, modeDescription } from "@/lib/extractClient";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { loadPermits, snapshotFilePath, sourceManifest, toClientPermit } from "@/lib/loadSnapshot";

export default function HomePage() {
  const permits = loadPermits();
  const client = permits.map(toClientPermit);
  const neighborhoods = [...new Set(permits.map((p) => p.neighborhood))].sort();
  const snapshotBytes = readFileSync(snapshotFilePath());
  const snapshotHash = createHash("sha256").update(snapshotBytes).digest("hex");
  const manifest = sourceManifest();
  const mode = currentAiMode();

  return (
    <div className="shell">
      <AppHeader
        snapshotDate={manifest.retrievalDate}
        modeLabel={`AI mode: ${mode}`}
        exportHref="/export"
        current="overview"
        isHome
      />
      <main id="main">
        <OverviewClient
          records={client}
          neighborhoods={neighborhoods}
          snapshotHash={snapshotHash}
          sourceUpdateDate={manifest.sourceUpdateDate}
          mode={modeDescription(mode)}
          retrievedAt={manifest.retrievalDate}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
