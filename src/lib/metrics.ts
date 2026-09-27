import type { Filters, MetricSet, PermitRecord, ReviewDecision } from "./types";

type MetricRecord = Pick<
  PermitRecord,
  | "recordId"
  | "sourcePermitId"
  | "issueDate"
  | "neighborhood"
  | "candidateDiscovery"
  | "qualityFlags"
>;

export function issueYear(date: string): string {
  return date.slice(0, 4);
}

export function issueMonth(date: string): string {
  return date.slice(0, 7);
}

export function applyFilters<T extends MetricRecord>(
  records: T[],
  filters: Filters,
  reviews: Record<string, ReviewDecision>,
): T[] {
  return records.filter((record) => {
    const query = filters.search?.trim().toLowerCase();
    if (query && !record.sourcePermitId.toLowerCase().includes(query) && !record.neighborhood.toLowerCase().includes(query)) return false;
    if (filters.year !== "all" && issueYear(record.issueDate) !== filters.year) return false;
    if (filters.neighborhood !== "all" && record.neighborhood !== filters.neighborhood) return false;
    if (filters.candidatesOnly && !record.candidateDiscovery.selected) return false;
    const review = reviews[record.recordId];
    const state = review?.state ?? "unreviewed";
    if (filters.reviewState === "all") return true;
    if (filters.reviewState === "needs_review") return state === "unreviewed";
    return state === filters.reviewState;
  });
}

export function computeMetrics(
  cohort: MetricRecord[],
  reviews: Record<string, ReviewDecision>,
  failedExtractionIds: string[],
  selectedYear?: string,
): MetricSet {
  const candidates = cohort.filter((r) => r.candidateDiscovery.selected);
  const reviewed = Object.values(reviews).filter(
    (d) => d.state !== "unreviewed" && cohort.some((r) => r.recordId === d.recordId),
  );
  const reviewedHousing = reviewed.filter(
    (d) =>
      (d.state === "accepted" || d.state === "corrected" || d.state === "source_reviewed") &&
      d.finalFields?.housingRelevance === "housing",
  );
  const needsReview = candidates.filter((r) => {
    const st = reviews[r.recordId]?.state ?? "unreviewed";
    return st === "unreviewed";
  }).length;
  const insufficient = reviewed.filter((d) => d.state === "insufficient_evidence").length;
  const rejected = reviewed.filter((d) => d.state === "rejected").length;
  const failed = failedExtractionIds.filter((id) => candidates.some((r) => r.recordId === id)).length;
  const withProposed = reviewedHousing.filter(
    (d) => d.finalFields?.proposedTotalUnitCount != null,
  ).length;

  const months = new Map<string, number>();
  const years = selectedYear && selectedYear !== "all" ? [selectedYear] : [...new Set(cohort.map((r) => issueYear(r.issueDate)))];
  for (const year of years) {
    for (let month = 1; month <= 12; month++) months.set(`${year}-${String(month).padStart(2, "0")}`, 0);
  }
  for (const record of cohort) {
    const m = issueMonth(record.issueDate);
    months.set(m, (months.get(m) ?? 0) + 1);
  }
  const monthlyIssued = [...months.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month, count }));

  const analyzed = candidates.filter((r) => {
    const st = reviews[r.recordId]?.state ?? "unreviewed";
    return st !== "unreviewed" || failedExtractionIds.includes(r.recordId);
  }).length;

  return {
    permitRecordsInCohort: cohort.length,
    potentialHousingRecords: candidates.length,
    reviewedRecords: reviewed.length,
    reviewedHousingRecords: reviewedHousing.length,
    needsReview,
    insufficientEvidence: insufficient,
    rejected,
    failedExtractions: failed,
    recordsWithExplicitProposedUnitMention: withProposed,
    monthlyIssued,
    extractionCoverageNumerator: analyzed,
    extractionCoverageDenominator: candidates.length,
    blankDescriptions: cohort.filter((r) => r.qualityFlags.includes("blank_description")).length,
  };
}

export function defaultFilters(): Filters {
  return {
    year: "2025",
    neighborhood: "all",
    reviewState: "all",
    candidatesOnly: true,
  };
}
