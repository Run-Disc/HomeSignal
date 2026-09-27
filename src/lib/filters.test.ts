import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { defaultFilters } from "./metrics";
import { filtersFromSearchParams, filtersToSearchParams } from "./filters";

describe("export filter query", () => {
  it("round-trips overview filters into export query params", () => {
    const filters = { ...defaultFilters(), neighborhood: "Middle Hill", reviewState: "source_reviewed" as const, search: "BDA-2024-05307" };
    const query = filtersToSearchParams(filters, "pli:BDA-2024-05307");
    const parsed = filtersFromSearchParams(new URLSearchParams(query));
    assert.equal(parsed.neighborhood, "Middle Hill");
    assert.equal(parsed.reviewState, "source_reviewed");
    assert.equal(parsed.search, "BDA-2024-05307");
    assert.equal(parsed.candidatesOnly, true);
    assert.equal(new URLSearchParams(query).get("example"), "pli:BDA-2024-05307");
  });
});
