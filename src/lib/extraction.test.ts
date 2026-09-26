import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SCHEMA_VERSION } from "./constants";
import { validateProposal } from "./extraction";
import type { PermitRecord } from "./types";

const record: PermitRecord = {
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
  snapshotVersion: "pli-2025-bda-v1",
  qualityFlags: [],
  candidateDiscovery: { selected: true, method: "keyword_or_structured_work_type" },
  inReviewCorpus: true,
  inComparisonSample: false,
};

const hash = "abc";

function baseProposal(over: Record<string, unknown> = {}) {
  return {
    targetRecordId: "pli:TEST-1",
    sanitizedInputHash: hash,
    snapshotVersion: "pli-2025-bda-v1",
    housingRelevance: "housing",
    proposedScope: "new_building",
    existingUnitCount: null,
    proposedTotalUnitCount: 12,
    explicitAddedUnitCount: null,
    explicitRemovedUnitCount: null,
    countEvidence: {
      proposedTotalUnitCount: {
        field: "workDescriptionSanitized",
        quote: "12 DWELLING UNITS",
        start: 0,
        end: 16,
        interpretation: "explicit proposed dwelling-unit total",
      },
    },
    classificationEvidence: {
      housingRelevance: {
        field: "workDescriptionSanitized",
        quote: "DWELLING UNITS",
        start: 0,
        end: 14,
        interpretation: "dwelling units described",
      },
      proposedScope: {
        field: "workDescriptionSanitized",
        quote: "NEW FOUR-STORY BUILDING",
        start: 0,
        end: 22,
        interpretation: "new building language",
      },
    },
    explanation: "Description states a new building with 12 dwelling units.",
    missingEvidence: [],
    followUpRole: "City permit/inspection staff",
    followUpQuestion: "Confirm whether this issued permit became occupied housing.",
    modelId: "test-model",
    promptVersion: "homesignal-extract-v1",
    schemaVersion: SCHEMA_VERSION,
    generatedAt: "2026-09-26T12:00:00Z",
    originLabel: "live",
    ...over,
  };
}

describe("extraction validation", () => {
  it("accepts matching quotes and repairs offsets", () => {
    const result = validateProposal(record, hash, baseProposal());
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.value.countEvidence.proposedTotalUnitCount?.quote, "12 DWELLING UNITS");
      assert.ok((result.value.countEvidence.proposedTotalUnitCount?.start ?? -1) >= 0);
    }
  });

  it("rejects unsupported keys", () => {
    const result = validateProposal(record, hash, { ...baseProposal(), extra: true });
    assert.equal(result.ok, false);
  });

  it("rejects arbitrary citation-like keys by schema strictness", () => {
    const result = validateProposal(record, hash, { ...baseProposal(), inventedCitation: "src:bogus" });
    assert.equal(result.ok, false);
  });

  it("rejects missing count evidence", () => {
    const result = validateProposal(
      record,
      hash,
      baseProposal({ proposedTotalUnitCount: 12, countEvidence: {} }),
    );
    assert.equal(result.ok, false);
  });

  it("rejects quotes not in the description", () => {
    const result = validateProposal(
      record,
      hash,
      baseProposal({
        countEvidence: {
          proposedTotalUnitCount: {
            field: "workDescriptionSanitized",
            quote: "99 HOMES BUILT",
            start: 0,
            end: 14,
            interpretation: "invented",
          },
        },
      }),
    );
    assert.equal(result.ok, false);
  });

  it("rejects record mismatch", () => {
    const result = validateProposal(record, hash, baseProposal({ targetRecordId: "pli:OTHER" }));
    assert.equal(result.ok, false);
  });

  it("rejects count evidence drawn from administrative class", () => {
    const result = validateProposal(
      record,
      hash,
      baseProposal({
        countEvidence: {
          proposedTotalUnitCount: {
            field: "sourceClassRaw",
            quote: "Commercial",
            start: 0,
            end: 10,
            interpretation: "class is not a unit count",
          },
        },
      }),
    );
    assert.equal(result.ok, false);
  });
});
