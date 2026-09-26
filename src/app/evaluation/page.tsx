import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { currentAiMode } from "@/lib/extractClient";
import { sourceManifest } from "@/lib/loadSnapshot";

export default function EvaluationPage() {
  const m = sourceManifest();
  return (
    <div className="shell">
      <AppHeader snapshotDate={m.retrievalDate} modeLabel={`AI mode: ${currentAiMode()}`} />
      <main id="main" className="prose">
        <h1>Evaluation</h1>
        <p>
          No independent accuracy percentage is reported. The labeling sheet in{" "}
          <code>data/evaluation/labeling-sheet.json</code> is unlabeled. Cursor assembled the sheet from the
          snapshot and did not fill ground-truth labels.
        </p>
        <p>
          Synthetic adversarial strings in <code>data/evaluation/adversarial-synthetic.json</code> are not City
          records and are not shown in the overview table.
        </p>
        <p>
          Automated checks currently cover metrics, CSV safety, snapshot privacy, and extraction-schema
          validation on fixtures. Live-model agreement has not been measured because no runtime key is
          configured and no saved genuine responses exist.
        </p>
        <p>
          <Link href="/">Overview</Link> · <Link href="/sources">Sources</Link>
        </p>
      </main>
    </div>
  );
}
