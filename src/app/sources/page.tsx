import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { CITY_PERMIT_GUIDANCE, ONESTOP, SOURCE_DUMP, SOURCE_LANDING, SOURCE_RESOURCE } from "@/lib/constants";
import { currentAiMode, modeDescription, readSavedExamples } from "@/lib/extractClient";
import { sourceManifest } from "@/lib/loadSnapshot";

export default function SourcesPage() {
  const m = sourceManifest();
  const mode = currentAiMode();
  return (
    <div className="shell">
      <AppHeader snapshotDate={m.retrievalDate} modeLabel={`AI mode: ${mode}`} />
      <main id="main" className="prose">
        <h1>Sources and method</h1>
        <p>{modeDescription(mode)}</p>
        <p>
          Decision support only. Verify project details and completion with the responsible public authority.
        </p>
        <h2>Primary source</h2>
        <ul>
          <li>Title: {m.title}</li>
          <li>Publisher: {m.publisher}</li>
          <li>
            Landing page: <a href={SOURCE_LANDING}>{SOURCE_LANDING}</a>
          </li>
          <li>
            Resource: <a href={SOURCE_RESOURCE}>{SOURCE_RESOURCE}</a>
          </li>
          <li>
            Dump URL used: <a href={SOURCE_DUMP}>{SOURCE_DUMP}</a>
          </li>
          <li>Resource ID: {m.sourceId}</li>
          <li>Retrieval date: {m.retrievalDate}</li>
          <li>Source last_modified: {m.sourceUpdateDate}</li>
          <li>Covered dates in this product: {m.coveredDates}</li>
          <li>Geography: {m.geography}</li>
          <li>License: {m.license}</li>
          <li>Downloaded rows: {m.downloadedRows}</li>
          <li>Accepted 2025 Building/BDA unique IDs: {m.acceptedCohortRows}</li>
          <li>Potential housing candidates: {m.candidateCount}</li>
          <li>Review-corpus allowlist: {m.reviewCorpusCount}</li>
          <li>Comparison sample without keywords: {m.comparisonSampleCount}</li>
          <li>Blank descriptions in cohort: {m.blankDescriptionsInCohort}</li>
          <li>Snapshot version: {m.snapshotVersion}</li>
        </ul>
        <p>{m.catalogPreviewNote}</p>
        <h2>Fields used</h2>
        <p>
          permit_id, permit_type, work_description, work_type, commercial_or_residential, issue_date,
          neighborhood, status. Parcel numbers, owner names, contractor names, and street addresses
          are excluded from the public snapshot, prompts, and exports.
        </p>
        <h2>Excluded fields</h2>
        <p>
          owner_name, contractor_name, address, parcel_num, latitude, longitude, total_project_value,
          contact details.
        </p>
        <h2>Candidate selection</h2>
        <p>
          A record is a “potential housing record” if the sanitized description contains a documented
          keyword (dwelling, apartment, conversion, and similar) or the work type contains NEW,
          CONVERSION, CHANGE OF USE, or DEMOLITION. All administrative classes are retained. This is a
          project choice, not an official City classification, and is not labeled “all housing permits.”
        </p>
        <h2>Official context (not ingested as metrics)</h2>
        <ul>
          <li>
            City permit classifications: <a href={CITY_PERMIT_GUIDANCE}>{CITY_PERMIT_GUIDANCE}</a>
          </li>
          <li>
            OneStopPGH permit center: <a href={ONESTOP}>{ONESTOP}</a>
          </li>
        </ul>
        <h2>Model role</h2>
        <p>
          Optional server-side extraction for the 120-record review corpus. Saved genuine examples in this
          snapshot: {readSavedExamples().length}. If that number is 0, no live model call has been stored.
        </p>
        <p>
          <Link href="/limitations">Limitations</Link> · <Link href="/evaluation">Evaluation</Link> ·{" "}
          <Link href="/">Overview</Link>
        </p>
      </main>
    </div>
  );
}
