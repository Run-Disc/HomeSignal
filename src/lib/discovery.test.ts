import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { explainDiscovery } from "./discovery";

describe("keyword/work-type discovery aid", () => {
  it("explains the flagship commercial dwelling-unit language", () => {
    const explanation = explainDiscovery({
      workDescriptionSanitized:
        "CONSTRUCT A NEW FOUR-STORY BUILDING WITH FUTURE COMMERCIAL TENANT SPACE AND TOTAL OF 12 DWELLING UNITS ABOVE.",
      workTypeRaw: "New Construction",
      candidateDiscovery: { selected: true, method: "keyword_or_structured_work_type" },
    });
    assert.equal(explanation.selected, true);
    assert.ok(explanation.keywordHits.includes("DWELLING"));
    assert.ok(explanation.workTypeHits.includes("NEW"));
    assert.ok(/false positives/i.test(explanation.caveat));
    assert.equal(/model output/i.test(explanation.summary), false);
  });

  it("does not treat a comparison office record as a keyword candidate", () => {
    const explanation = explainDiscovery({
      workDescriptionSanitized: "RECONFIGURATION OF OFFICE SPACE AND EXTENSION OF EXTERIOR EGRESS STAIR LANDING",
      workTypeRaw: "Existing (alteration/addition)",
      candidateDiscovery: { selected: false, method: "keyword_or_structured_work_type" },
    });
    assert.equal(explanation.selected, false);
    assert.equal(explanation.keywordHits.length, 0);
  });
});
