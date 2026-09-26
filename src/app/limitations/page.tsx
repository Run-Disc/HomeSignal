import { AppHeader } from "@/components/AppHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { currentAiMode } from "@/lib/extractClient";
import { sourceManifest } from "@/lib/loadSnapshot";

export default function LimitationsPage() {
  const m = sourceManifest();
  return (
    <div className="shell">
      <AppHeader snapshotDate={m.retrievalDate} modeLabel={`AI mode: ${currentAiMode()}`} current="limitations" />
      <main id="main" className="prose">
        <h1>Limitations</h1>
        <ul>
          <li>A permit record is not a housing unit. This product has no aggregate housing-unit total.</li>
          <li>An issued permit is not evidence that construction started, finished, passed inspection, or became occupied.</li>
          <li>Source status is a current label, not a historical timeline.</li>
          <li>This source alone cannot support a proposed → issued → completed funnel.</li>
          <li>Unit numbers in text may describe existing units, proposed totals, additions, removals, or unrelated work.</li>
          <li>Stories, bedrooms, and valuations are not unit counts.</li>
          <li>Residential and commercial are administrative classes. Commercial records can include housing.</li>
          <li>Permit IDs can describe the same building or project more than once.</li>
          <li>A text-filter exclusion is not proof of no housing.</li>
          <li>Missing, unknown, unsupported, not applicable, and zero are different states.</li>
          <li>This snapshot is not a representative sample of every development project.</li>
          <li>Cost burden, affordability, displacement, migration, and availability cannot be inferred from permit text.</li>
          <li>No causal claim that permitting changed rents, and no landlord or resident scoring.</li>
          <li>Parcel numbers, owner names, contractor names, and street addresses are excluded from the public snapshot.</li>
          <li>Blank descriptions: {m.blankDescriptionsInCohort} of {m.acceptedCohortRows} 2025 Building/BDA records.</li>
          <li>Local reviews persist only in this browser unless exported.</li>
          <li>Automated contact redaction is incomplete. Do not treat displayed text as fully de-identified.</li>
        </ul>
        <p>Decision support only. Verify project details and completion with the responsible public authority.</p>
      </main>
      <SiteFooter />
    </div>
  );
}
