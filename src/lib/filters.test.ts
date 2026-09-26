import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { defaultFilters } from "./metrics";
import { filtersFromSearchParams, filtersToSearchParams } from "./filters";

describe("export filter query", () => {
  it("round-trips overview filters into export query params", () => {
    const filters = { ...defaultFilters(), neighborhood: "Middle Hill", reviewState: "corrected" as const };
    const query = filtersToSearchParams(filters, "pli:BDA-2024-05307");
    const parsed = filtersFromSearchParams(new URLSearchParams(query));
    assert.equal(parsed.neighborhood, "Middle Hill");
    assert.equal(parsed.reviewState, "corrected");
    assert.equal(parsed.candidatesOnly, true);
    assert.equal(new URLSearchParams(query).get("example"), "pli:BDA-2024-05307");
  });
});
