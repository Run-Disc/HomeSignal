import { AppHeader } from "@/components/AppHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { currentAiMode } from "@/lib/extractClient";
import { sourceManifest } from "@/lib/loadSnapshot";

export const metadata = { title: "Limitations · HomeSignal" };

export default function LimitationsPage() {
  const m = sourceManifest();
  return (
    <div className="shell">
      <AppHeader snapshotDate={m.retrievalDate} modeLabel={`AI mode: ${currentAiMode()}`} current="limitations" />
      <main id="main" className="prose">
        <h1>Limitations</h1>
        <h2>Who benefits, and who could be harmed</h2>
        <p>Planners, housing advocates, and journalists can trace a housing claim back to a public permit description. Residents benefit when public discussion distinguishes proposed work from completed homes.</p>
        <p>Residents and neighborhoods could be harmed if incomplete permit records are used to label an area as declining, predict displacement, or steer investment away from it. Missing descriptions and uneven reporting can systematically hide activity. This tool must not rank residents or neighborhoods, allocate benefits, or automate enforcement.</p>
        <h2>What the tool gets wrong or cannot answer</h2>
        <p>Keyword discovery can miss housing work or flag unrelated work. An exact supporting quote confirms that text exists, not that a number was interpreted correctly. A human must verify the meaning and contact the responsible authority before consequential use.</p>
        <p>We lack reliable linked completion, occupancy, household-flow, displacement, and neighborhood affordability data. Regional rent and city survey context do not fill those gaps. Survey uncertainty is not quantified in the QuickFacts extract; do not use it to rank small differences.</p>
        <ul>
          <li>A permit record is not a housing unit. This product has no aggregate housing-unit total.</li>
          <li>An issued permit is not evidence that construction started, finished, passed inspection, or became occupied.</li>
          <li>Source status is a current label, not a historical timeline.</li>
          <li>This product is not the City Affordable Housing Development Project Explorer or the housing-development dashboard recommended in the June 2025 Controller report.</li>
          <li>
            This product does not interpret Pittsburgh zoning or score zoning feasibility. Official pages say
            district and use rules vary by location and project scope, and most building permits require zoning
            approval. Zoning links on Sources are for later lookup only.
          </li>
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
