import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { applyCountCorrection, parseCountValue } from "./reviewLogic";
import type { ReviewedFields } from "./types";

const source =
  "CONSTRUCT A NEW FOUR-STORY BUILDING WITH FUTURE COMMERCIAL TENANT SPACE ON THE FIRST FLOOR AND TOTAL OF 12 DWELLING UNITS ABOVE.";

function empty(): ReviewedFields {
  return {
    housingRelevance: "housing",
    proposedScope: "new_building",
    existingUnitCount: null,
    proposedTotalUnitCount: null,
    explicitAddedUnitCount: null,
    explicitRemovedUnitCount: null,
    countEvidence: {},
    unsourcedNotes: [],
  };
}

describe("manual count sourcing", () => {
  it("does not source a count without an exact matching quote", () => {
    const result = applyCountCorrection({
      draft: empty(),
      countKey: "proposedTotalUnitCount",
      countValue: "12",
      quote: "twelve homes completed",
      sourceText: source,
      reason: "guess",
    });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.field, "quote");
    }
  });

  it("sources a count only when the excerpt is present in the description", () => {
    const quote = "TOTAL OF 12 DWELLING UNITS ABOVE";
    const result = applyCountCorrection({
      draft: empty(),
      countKey: "proposedTotalUnitCount",
      countValue: "12",
      quote,
      sourceText: source,
      reason: "explicit proposed total",
    });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.sourced, true);
      assert.equal(result.fields.proposedTotalUnitCount, 12);
      assert.equal(result.fields.countEvidence.proposedTotalUnitCount?.quote, quote);
    }
  });

  it("treats a blank count as unknown rather than zero", () => {
    assert.deepEqual(parseCountValue(""), { ok: true, value: null });
    const result = applyCountCorrection({
      draft: empty(),
      countKey: "proposedTotalUnitCount",
      countValue: "",
      quote: "",
      sourceText: source,
      reason: "classification only",
    });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.fields.proposedTotalUnitCount, null);
      assert.equal(result.sourced, false);
    }
  });
});
