import type { Filters } from "./types";
import { defaultFilters } from "./metrics";

export function filtersToSearchParams(filters: Filters, exampleRecordId?: string): string {
  const p = new URLSearchParams();
  p.set("year", filters.year);
  p.set("neighborhood", filters.neighborhood);
  p.set("reviewState", filters.reviewState);
  p.set("universe", filters.candidatesOnly ? "candidates" : "cohort");
  if (exampleRecordId) p.set("example", exampleRecordId);
  return p.toString();
}

export function filtersFromSearchParams(params: URLSearchParams | { get(name: string): string | null }): Filters {
  const base = defaultFilters();
  const year = params.get("year");
  const neighborhood = params.get("neighborhood");
  const reviewState = params.get("reviewState");
  const universe = params.get("universe");
  if (year) base.year = year;
  if (neighborhood) base.neighborhood = neighborhood;
  if (
    reviewState === "all" ||
    reviewState === "needs_review" ||
    reviewState === "unreviewed" ||
    reviewState === "accepted" ||
    reviewState === "corrected" ||
    reviewState === "rejected" ||
    reviewState === "insufficient_evidence"
  ) {
    base.reviewState = reviewState;
  }
  if (universe === "cohort") base.candidatesOnly = false;
  if (universe === "candidates") base.candidatesOnly = true;
  return base;
}
