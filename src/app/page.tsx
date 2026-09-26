import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { OverviewClient } from "@/components/OverviewClient";
import { currentAiMode, modeDescription } from "@/lib/extractClient";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { loadPermits, sourceManifest, toClientPermit } from "@/lib/loadSnapshot";

export default function HomePage() {
  const permits = loadPermits();
  const client = permits.map(toClientPermit);
  const neighborhoods = [...new Set(permits.map((p) => p.neighborhood))].sort();
  const snapshotBytes = readFileSync(join(process.cwd(), "data/public/permits-2025.json"));
  const snapshotHash = createHash("sha256").update(snapshotBytes).digest("hex");
  const manifest = sourceManifest();
  const mode = currentAiMode();

  return (
    <div className="shell">
      <AppHeader
        snapshotDate={manifest.retrievalDate}
        modeLabel={`AI mode: ${mode}`}
        exportHref="/export"
      />
      <main id="main">
        <details className="defs">
          <summary>What these counts mean</summary>
          <ul>
            <li>A permit record is not a housing unit.</li>
            <li>An issued or “Completed” source status is not proof that construction finished or a home is occupied.</li>
            <li>Potential housing records are selected by a project keyword/work-type list. A record excluded by the filter is not proven to contain no housing.</li>
            <li>There is no aggregate homes-built number in this product.</li>
          </ul>
        </details>
        <OverviewClient
          records={client}
          neighborhoods={neighborhoods}
          snapshotHash={snapshotHash}
          sourceUpdateDate={manifest.sourceUpdateDate}
          mode={modeDescription(mode)}
          retrievedAt={manifest.retrievalDate}
        />
      </main>
      <footer className="page-foot">
        Data: City of Pittsburgh PLI Permits via WPRDC, Creative Commons Attribution.{" "}
        <Link href="/sources">Sources and method</Link> · <Link href="/limitations">Limitations</Link>
      </footer>
    </div>
  );
}
