import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SCHEMA_VERSION, SNAPSHOT_VERSION } from "./constants";
import { buildDemoProposal } from "./demoExtraction";
import type { PermitRecord } from "./types";

function permit(over: Partial<PermitRecord> = {}): PermitRecord {
  return {
    recordId: "pli:TEST-1",
    sourcePermitId: "TEST-1",
    sourceResourceId: "f4d1177a-f597-4c32-8cbf-7885f56253f6",
    issueDate: "2025-04-23",
    permitTypeRaw: "Building & Development Application",
    permitTypeNormalized: "building_development_application",
    sourceClassRaw: "Commercial",
    workTypeRaw: "New Construction",
    sourceStatusRaw: "Issued",
    neighborhood: "Middle Hill",
    workDescriptionSanitized:
      "CONSTRUCT A NEW FOUR-STORY BUILDING WITH A BASEMENT. TOTAL OF 12 DWELLING UNITS ABOVE.",
    citationId: "src:pli:TEST-1",
    snapshotVersion: SNAPSHOT_VERSION,
    qualityFlags: [],
    candidateDiscovery: { selected: true, method: "keyword_or_structured_work_type" },
    inReviewCorpus: true,
    inComparisonSample: false,
    ...over,
  };
}

describe("labeled demo extraction", () => {
  it("quotes dwelling units from the description and labels the origin as synthetic", () => {
    const result = buildDemoProposal(permit(), "hash-1");
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.value.originLabel, "synthetic_demo");
    assert.equal(result.value.schemaVersion, SCHEMA_VERSION);
    assert.equal(result.value.proposedTotalUnitCount, 12);
    assert.equal(result.value.countEvidence.proposedTotalUnitCount?.quote.includes("12 DWELLING UNITS"), true);
    assert.match(result.value.explanation, /SYNTHETIC DEMO/);
    assert.equal(result.value.modelId.includes("demo"), true);
  });

  it("does not treat parking, stories, years, or accessibility units as dwelling counts", () => {
    const result = buildDemoProposal(
      permit({
        workDescriptionSanitized:
          "CONSTRUCT A NEW FOUR-STORY BUILDING IN 2025 WITH 20 PARKING SPACES AND 3 ACCESSIBLE UNITS.",
      }),
      "hash-3",
    );
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.value.proposedTotalUnitCount, null);
    assert.equal(result.value.existingUnitCount, null);
  });
});
