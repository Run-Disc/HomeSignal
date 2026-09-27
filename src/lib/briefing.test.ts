import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { briefingCsv, briefingText } from "./briefing";
import type { ClientPermit, ReviewDecision } from "./types";
import { defaultFilters } from "./metrics";

function permit(id: string, desc: string): ClientPermit {
  return {
    recordId: `pli:${id}`,
    sourcePermitId: id,
    sourceResourceId: "f4d1177a-f597-4c32-8cbf-7885f56253f6",
    issueDate: "2025-04-23",
    permitTypeRaw: "Building & Development Application",
    permitTypeNormalized: "building_development_application",
    sourceClassRaw: "Commercial",
    workTypeRaw: "New Construction",
    sourceStatusRaw: "Issued",
    neighborhood: "Middle Hill",
    workDescriptionSanitized: desc,
    citationId: `src:pli:${id}`,
    snapshotVersion: "pli-2025-bda-v1",
    qualityFlags: [],
    candidateDiscovery: { selected: true, method: "keyword_or_structured_work_type" },
    inReviewCorpus: true,
    inComparisonSample: false,
    inputHash: "hash",
    descriptionPreview: desc.slice(0, 80),
  };
}

describe("briefing export", () => {
  const records = [
    permit("BDA-2024-05307", "TOTAL OF 12 DWELLING UNITS ABOVE"),
    permit("UNREVIEWED-1", "DWELLING UNITS"),
  ];
  const reviews: Record<string, ReviewDecision> = {
    "pli:BDA-2024-05307": {
      recordId: "pli:BDA-2024-05307",
      snapshotVersion: "pli-2025-bda-v1",
      sanitizedInputHash: "hash",
      origin: "manual_source_review",
      proposalVersion: null,
      state: "corrected",
      reviewerRole: "local_reviewer",
      timestamp: "2026-09-26T18:00:00Z",
      finalFields: {
        housingRelevance: "housing",
        proposedScope: "new_building",
        existingUnitCount: null,
        proposedTotalUnitCount: 12,
        explicitAddedUnitCount: null,
        explicitRemovedUnitCount: null,
        countEvidence: {
          proposedTotalUnitCount: {
            field: "workDescriptionSanitized",
            quote: "TOTAL OF 12 DWELLING UNITS ABOVE",
            start: 0,
            end: 32,
            interpretation: "proposed total",
          },
        },
        unsourcedNotes: [],
      },
      reason: "Proposed-unit language on an issued permit.",
    },
  };

  it("lists only reviewed evidence and names the export scope", () => {
    const text = briefingText({
      preparedAt: "2026-09-26T18:00:00Z",
      filters: defaultFilters(),
      metrics: {
        permitRecordsInCohort: 4243,
        potentialHousingRecords: 727,
        reviewedRecords: 1,
        reviewedHousingRecords: 1,
        needsReview: 726,
        insufficientEvidence: 0,
        rejected: 0,
        failedExtractions: 0,
        recordsWithExplicitProposedUnitMention: 1,
        monthlyIssued: [{ month: "2025-04", count: 1 }],
        extractionCoverageNumerator: 1,
        extractionCoverageDenominator: 727,
        blankDescriptions: 2417,
      },
      snapshotVersion: "pli-2025-bda-v1",
      snapshotHash: "abc",
      sourceUpdateDate: "2026-09-26T03:22:05.014160",
      mode: "source-review",
      records,
      reviews,
      featuredRecordId: "pli:BDA-2024-05307",
    });
    assert.match(text, /Export scope/);
    assert.match(text, /BDA-2024-05307/);
    assert.match(text, /TOTAL OF 12 DWELLING UNITS ABOVE/);
    assert.match(text, /not housing production/);
    assert.equal(text.includes("UNREVIEWED-1"), false);
    const csv = briefingCsv(records, reviews);
    assert.match(csv, /BDA-2024-05307/);
    assert.equal(csv.includes("UNREVIEWED-1"), false);
    assert.match(csv, /manual_source_review/);
  });

  it("neutralizes formula prefixes in reviewed CSV cells", () => {
    const poisoned = permit("X", "=cmd");
    const csv = briefingCsv([poisoned], {
      "pli:X": {
        ...reviews["pli:BDA-2024-05307"],
        recordId: "pli:X",
        reason: "=cmd",
      },
    });
    assert.match(csv, /"'=cmd"/);
  });

  it("excludes stale source reviews and carries full provenance with current evidence", () => {
    const stale = { ...reviews, "pli:BDA-2024-05307": { ...reviews["pli:BDA-2024-05307"], sanitizedInputHash: "old-hash" } };
    assert.equal(briefingCsv(records, stale).includes("BDA-2024-05307"), false);
    const csv = briefingCsv(records, reviews);
    assert.match(csv, /snapshotVersion/);
    assert.match(csv, /pli-2025-bda-v1/);
    assert.match(csv, /https:\/\/data.wprdc.org\/dataset\/pli-permits\/resource\//);
  });
});
