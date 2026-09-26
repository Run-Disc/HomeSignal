import { readFileSync } from "node:fs";
import { join } from "node:path";
import { SNAPSHOT_VERSION, SOURCE_RESOURCE_ID } from "./constants";
import { sanitizedInputHash } from "./hash";
import type { ClientPermit, PermitRecord } from "./types";

const PUBLIC_RECORD_KEYS = [
  "recordId",
  "sourcePermitId",
  "sourceResourceId",
  "issueDate",
  "permitTypeRaw",
  "permitTypeNormalized",
  "sourceClassRaw",
  "workTypeRaw",
  "sourceStatusRaw",
  "neighborhood",
  "workDescriptionSanitized",
  "citationId",
  "snapshotVersion",
  "qualityFlags",
  "candidateDiscovery",
  "inReviewCorpus",
  "inComparisonSample",
] as const satisfies ReadonlyArray<keyof PermitRecord>;

let cached: PermitRecord[] | null = null;

function asPublicRecord(raw: Record<string, unknown>): PermitRecord {
  const record = {} as PermitRecord;
  for (const key of PUBLIC_RECORD_KEYS) {
    (record as unknown as Record<string, unknown>)[key] = raw[key];
  }
  return record;
}

export function loadPermits(): PermitRecord[] {
  if (cached) return cached;
  const path = join(process.cwd(), "data/public/permits-2025.json");
  const parsed = JSON.parse(readFileSync(path, "utf8")) as Array<Record<string, unknown>>;
  cached = parsed.filter((r) => r.snapshotVersion === SNAPSHOT_VERSION).map(asPublicRecord);
  return cached;
}

export function toClientPermit(record: PermitRecord): ClientPermit {
  const desc = record.workDescriptionSanitized || "";
  return {
    ...record,
    inputHash: sanitizedInputHash(record),
    descriptionPreview: desc.length > 180 ? `${desc.slice(0, 177)}…` : desc,
  };
}

export function findPermit(recordId: string): PermitRecord | undefined {
  return loadPermits().find((r) => r.recordId === recordId);
}

export function allowlistedForExtraction(record: PermitRecord): boolean {
  return record.inReviewCorpus;
}

export function sourceManifest() {
  const records = loadPermits();
  return {
    snapshotVersion: SNAPSHOT_VERSION,
    sourceId: SOURCE_RESOURCE_ID,
    title: "PLI Permits",
    publisher: "City of Pittsburgh, published via Western Pennsylvania Regional Data Center",
    landingUrl: "https://data.wprdc.org/dataset/pli-permits",
    resourceUrl:
      "https://data.wprdc.org/dataset/pli-permits/resource/f4d1177a-f597-4c32-8cbf-7885f56253f6",
    downloadUrl: "https://data.wprdc.org/datastore/dump/f4d1177a-f597-4c32-8cbf-7885f56253f6",
    license: "Creative Commons Attribution (cc-by)",
    licenseUrl: "http://www.opendefinition.org/licenses/cc-by",
    retrievalDate: "2026-09-26",
    sourceUpdateDate: "2026-09-26T03:22:05.014160",
    coveredDates: "issue dates 2025-01-01 through 2025-12-31 in the downloaded dump",
    geography: "City of Pittsburgh neighborhoods as labeled in the source",
    downloadedRows: 65378,
    acceptedCohortRows: records.length,
    candidateCount: records.filter((r) => r.candidateDiscovery.selected).length,
    reviewCorpusCount: records.filter((r) => r.inReviewCorpus).length,
    comparisonSampleCount: records.filter((r) => r.inComparisonSample).length,
    blankDescriptionsInCohort: records.filter((r) => r.qualityFlags.includes("blank_description")).length,
    catalogPreviewRowCount: 49255,
    catalogPreviewNote:
      "The resource HTML preview_rows/total_record_count fields still showed 49255 while datastore_search and the CSV dump both reported 65378 rows. HomeSignal uses the downloaded dump count.",
  };
}
