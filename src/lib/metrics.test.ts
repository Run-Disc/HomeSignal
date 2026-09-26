import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { applyFilters, computeMetrics, defaultFilters } from "./metrics";
import type { PermitRecord, ReviewDecision } from "./types";

function rec(partial: Partial<PermitRecord> & Pick<PermitRecord, "recordId" | "issueDate" | "neighborhood">): PermitRecord {
  return {
    sourcePermitId: partial.recordId.replace("pli:", ""),
    sourceResourceId: "f4d1177a-f597-4c32-8cbf-7885f56253f6",
    permitTypeRaw: "Building & Development Application",
    permitTypeNormalized: "building_development_application",
    sourceClassRaw: "Residential",
    workTypeRaw: "Existing (alteration/addition)",
    sourceStatusRaw: "Issued",
    workDescriptionSanitized: "TEST",
    citationId: `src:${partial.recordId}`,
    snapshotVersion: "pli-2025-bda-v1",
    qualityFlags: [],
    candidateDiscovery: { selected: true, method: "keyword_or_structured_work_type" },
    inReviewCorpus: true,
    inComparisonSample: false,
    ...partial,
  };
}

describe("metrics", () => {
  const records = [
    rec({ recordId: "pli:A", issueDate: "2025-01-15", neighborhood: "Shadyside", sourceClassRaw: "Commercial" }),
    rec({
      recordId: "pli:B",
      issueDate: "2025-02-01",
      neighborhood: "Brookline",
      candidateDiscovery: { selected: false, method: "keyword_or_structured_work_type" },
    }),
    rec({ recordId: "pli:C", issueDate: "2025-02-20", neighborhood: "Shadyside", qualityFlags: ["blank_description"], workDescriptionSanitized: "" }),
  ];

  it("keeps commercial candidates and does not emit unit totals", () => {
    const metrics = computeMetrics(records, {}, []);
    assert.equal(metrics.permitRecordsInCohort, 3);
    assert.equal(metrics.potentialHousingRecords, 2);
    assert.equal(metrics.recordsWithExplicitProposedUnitMention, 0);
    assert.equal(metrics.monthlyIssued.find((m) => m.month === "2025-02")?.count, 2);
    assert.ok(!("homesBuilt" in metrics));
  });

  it("updates reviewed and needs-review counts from decisions", () => {
    const reviews: Record<string, ReviewDecision> = {
      "pli:A": {
        recordId: "pli:A",
        snapshotVersion: "pli-2025-bda-v1",
        sanitizedInputHash: "x",
        origin: "manual_source_review",
        proposalVersion: null,
        state: "accepted",
        reviewerRole: "local_reviewer",
        timestamp: "2026-09-26T00:00:00Z",
        finalFields: {
          housingRelevance: "housing",
          proposedScope: "conversion",
          existingUnitCount: null,
          proposedTotalUnitCount: 2,
          explicitAddedUnitCount: null,
          explicitRemovedUnitCount: null,
          countEvidence: {},
          unsourcedNotes: [],
        },
        reason: "ok",
      },
      "pli:C": {
        recordId: "pli:C",
        snapshotVersion: "pli-2025-bda-v1",
        sanitizedInputHash: "x",
        origin: "manual_source_review",
        proposalVersion: null,
        state: "insufficient_evidence",
        reviewerRole: "local_reviewer",
        timestamp: "2026-09-26T00:00:00Z",
        finalFields: null,
        reason: "blank",
      },
    };
    const metrics = computeMetrics(records, reviews, ["pli:C"]);
    assert.equal(metrics.reviewedRecords, 2);
    assert.equal(metrics.reviewedHousingRecords, 1);
    assert.equal(metrics.needsReview, 0);
    assert.equal(metrics.insufficientEvidence, 1);
    assert.equal(metrics.recordsWithExplicitProposedUnitMention, 1);
    assert.equal(metrics.failedExtractions, 1);
  });

  it("filters neighborhood and sample labeling stays candidate-only when requested", () => {
    const filtered = applyFilters(records, { ...defaultFilters(), neighborhood: "Shadyside" }, {});
    assert.equal(filtered.length, 2);
    assert.ok(filtered.every((r) => r.neighborhood === "Shadyside"));
    const all = applyFilters(records, { ...defaultFilters(), candidatesOnly: false, neighborhood: "all" }, {});
    assert.equal(all.length, 3);
  });
});
