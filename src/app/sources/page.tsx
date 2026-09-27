import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { SiteFooter } from "@/components/SiteFooter";
import {
  AFFORDABLE_HOUSING_EXPLORER,
  AFFORDABLE_HOUSING_EXPLORER_NEWS,
  CITY_GIS_MAPS,
  CITY_PERMIT_GUIDANCE,
  CONTROLLER_IZ_REPORT,
  ONESTOP,
  ONESTOP_INSIGHTS,
  SOURCE_DUMP,
  SOURCE_LANDING,
  SOURCE_RESOURCE,
  ZONING_CODE,
  ZONING_CODE_CATALOG,
  ZONING_FAQ,
  ZONING_MAP,
  ZONING_MAP_CATALOG,
  ZONING_PAGE,
} from "@/lib/constants";
import { currentAiMode, modeDescription, readSavedExamples } from "@/lib/extractClient";
import { sourceManifest } from "@/lib/loadSnapshot";

export default function SourcesPage() {
  const m = sourceManifest();
  const mode = currentAiMode();
  return (
    <div className="shell">
      <AppHeader snapshotDate={m.retrievalDate} modeLabel={`AI mode: ${mode}`} current="sources" />
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
        <h2>Related Pittsburgh tools (not this product)</h2>
        <p>
          Pittsburgh already publishes project and dashboard tools. HomeSignal does not replace them. It is a
          privacy-reduced review of permit descriptions: exact quotes, records kept separate from proposed units.
        </p>
        <ul>
          <li>
            OneStopPGH Insights guided tour (City record map and statistics dashboard):{" "}
            <a href={ONESTOP_INSIGHTS}>{ONESTOP_INSIGHTS}</a>
          </li>
          <li>
            Affordable Housing Development Project Explorer:{" "}
            <a href={AFFORDABLE_HOUSING_EXPLORER}>{AFFORDABLE_HOUSING_EXPLORER}</a>
          </li>
          <li>
            City announcement (17 April 2025):{" "}
            <a href={AFFORDABLE_HOUSING_EXPLORER_NEWS}>{AFFORDABLE_HOUSING_EXPLORER_NEWS}</a>
          </li>
          <li>
            City Controller June 2025 report (recommends a broader housing-development dashboard):{" "}
            <a href={CONTROLLER_IZ_REPORT}>{CONTROLLER_IZ_REPORT}</a>
          </li>
        </ul>
        <h2>Official permit context (not ingested as metrics)</h2>
        <ul>
          <li>
            City permit classifications: <a href={CITY_PERMIT_GUIDANCE}>{CITY_PERMIT_GUIDANCE}</a>
          </li>
          <li>
            OneStopPGH permit center: <a href={ONESTOP}>{ONESTOP}</a>
          </li>
        </ul>
        <h2>Zoning — future verification links only</h2>
        <p>
          Not ingested. Not current feasibility output. City pages state that districts regulate potential uses,
          that approval processes vary by project type, scope, and location, and that most building permits
          require zoning approval (ROZA).
        </p>
        <ul>
          <li>
            City Zoning page: <a href={ZONING_PAGE}>{ZONING_PAGE}</a>
          </li>
          <li>
            Zoning FAQ: <a href={ZONING_FAQ}>{ZONING_FAQ}</a>
          </li>
          <li>
            Zoning Code, Title 9 (eCode360): <a href={ZONING_CODE}>{ZONING_CODE}</a>
          </li>
          <li>
            Catalog-supplied code URL (404 as of 2026-09-26): {ZONING_CODE_CATALOG}
          </li>
          <li>
            Zoning districts / map download (WPRDC): <a href={ZONING_MAP}>{ZONING_MAP}</a>
          </li>
          <li>
            Catalog-supplied map URL (404 as of 2026-09-26): {ZONING_MAP_CATALOG}
          </li>
          <li>
            City GIS maps directory: <a href={CITY_GIS_MAPS}>{CITY_GIS_MAPS}</a>
          </li>
        </ul>
        <h2>Model role</h2>
        <p>
          Optional server-side extraction exists in code for a 120-record allowlist when a separate runtime
          key is configured. Saved genuine examples in this snapshot: {readSavedExamples().length}. Zero
          means no live model call has been stored. Cursor is not a runtime model.
        </p>
        <p>
          <Link href="/limitations">Limitations</Link> · <Link href="/evaluation">Evaluation</Link> ·{" "}
          <Link href="/">Queue</Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
