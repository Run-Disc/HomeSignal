import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { currentAiMode } from "@/lib/extractClient";
import { sourceManifest } from "@/lib/loadSnapshot";

export const metadata = { title: "Evaluation · HomeSignal" };

export default function EvaluationPage() {
  const m = sourceManifest();
  return (
    <div className="shell">
      <AppHeader snapshotDate={m.retrievalDate} modeLabel={`AI mode: ${currentAiMode()}`} current="evaluation" />
      <main id="main" className="prose">
        <h1>Evaluation</h1>
        <p>
          A readable 12-row worksheet for independent human labels is in{" "}
          <code>data/evaluation/blind-label-worksheet.md</code>. Held-out IDs stay off that sheet’s answer
          columns on purpose. Until those labels exist, housing-relevance agreement is not measured.
        </p>
        <p>
          Synthetic strings in <code>data/evaluation/adversarial-synthetic.json</code> are labeled{" "}
          <strong>synthetic_adversarial</strong>. They are not City of Pittsburgh permits, they are not shown
          in the queue, and they are excluded from factual metrics. They only test validator behavior in
          unit tests.
        </p>
        <p>
          Automated checks currently cover metrics, CSV safety, snapshot privacy, extraction-schema
          validation, labeled demo extraction, and simulated runtime-AI grounding. Live-vendor agreement has not been measured because no runtime key is
          configured and no saved genuine vendor responses exist.
        </p>
        <p>
          <Link href="/">Overview</Link> · <Link href="/sources">Sources</Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
