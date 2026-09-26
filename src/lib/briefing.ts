import { COUNT_LABELS, DECISION_SUPPORT, SCOPE_LABELS } from "./constants";
import { toCsv } from "./csv";
import type { ClientPermit, Filters, MetricSet, ReviewDecision } from "./types";

export function reviewerLabel(role: ReviewDecision["reviewerRole"]): string {
  return role === "prototype_builder" ? "Prototype review by project builder" : "Your local review";
}

export function briefingText(args: {
  preparedAt: string;
  filters: Filters;
  metrics: MetricSet;
  snapshotVersion: string;
  snapshotHash: string;
  sourceUpdateDate: string;
  mode: string;
  records: ClientPermit[];
  reviews: Record<string, ReviewDecision>;
}): string {
  const { preparedAt, filters, metrics, snapshotVersion, snapshotHash, sourceUpdateDate, mode, records, reviews } =
    args;
  const lines: string[] = [];
  lines.push("HomeSignal briefing — housing permit evidence, ready for review");
  lines.push(`Prepared: ${preparedAt}`);
  lines.push(`Source snapshot: ${snapshotVersion} (sha256 ${snapshotHash})`);
  lines.push(`WPRDC resource last_modified: ${sourceUpdateDate}`);
  lines.push(`AI mode: ${mode}`);
  lines.push("");
  lines.push("Filters");
  lines.push(`- Issue year: ${filters.year}`);
  lines.push(`- Neighborhood: ${filters.neighborhood}`);
  lines.push(`- Review state: ${filters.reviewState}`);
  lines.push(`- Table universe: ${filters.candidatesOnly ? "potential housing candidates" : "full selected cohort"}`);
  lines.push("");
  lines.push("Record-count findings (not housing-unit totals)");
  lines.push(`- Permit records in selected cohort: ${metrics.permitRecordsInCohort}`);
  lines.push(
    `- Potential housing records (keyword/work-type discovery aid, not a completeness guarantee): ${metrics.potentialHousingRecords}`,
  );
  lines.push(`- Reviewed records: ${metrics.reviewedRecords}`);
  lines.push(`- Reviewed as housing: ${metrics.reviewedHousingRecords}`);
  lines.push(`- Needs review (candidates without a final review): ${metrics.needsReview}`);
  lines.push(`- Insufficient evidence: ${metrics.insufficientEvidence}`);
  lines.push(`- Rejected proposals: ${metrics.rejected}`);
  lines.push(`- Failed extractions recorded locally: ${metrics.failedExtractions}`);
  lines.push(
    `- Records with an explicit proposed-unit mention among reviewed housing records: ${metrics.recordsWithExplicitProposedUnitMention} (this counts records, not units)`,
  );
  lines.push(
    `- Workflow coverage: ${metrics.extractionCoverageNumerator} / ${metrics.extractionCoverageDenominator} candidates`,
  );
  lines.push(`- Blank descriptions in selected cohort: ${metrics.blankDescriptions}`);
  lines.push("");
  lines.push("Monthly issued-record activity uses issue_date month from the downloaded 2025 cohort.");
  for (const row of metrics.monthlyIssued) {
    lines.push(`- ${row.month}: ${row.count} records`);
  }
  lines.push("");
  lines.push("Reviewed evidence");
  const reviewed = records
    .map((r) => ({ record: r, decision: reviews[r.recordId] }))
    .filter((x) => x.decision && x.decision.state !== "unreviewed");
  if (reviewed.length === 0) {
    lines.push("No local reviews in the current filter.");
  }
  for (const { record, decision } of reviewed) {
    lines.push(`Permit ${record.sourcePermitId} (${record.neighborhood}, ${record.issueDate})`);
    lines.push(`- Source class: ${record.sourceClassRaw ?? "Unknown"}`);
    lines.push(`- Citation: ${record.citationId}`);
    lines.push(`- Review: ${decision.state}; ${reviewerLabel(decision.reviewerRole)}; origin ${decision.origin}`);
    if (decision.finalFields) {
      lines.push(`- Relevance: ${SCOPE_LABELS[decision.finalFields.housingRelevance] ?? decision.finalFields.housingRelevance}`);
      lines.push(`- Scope: ${SCOPE_LABELS[decision.finalFields.proposedScope] ?? decision.finalFields.proposedScope}`);
      for (const key of [
        "existingUnitCount",
        "proposedTotalUnitCount",
        "explicitAddedUnitCount",
        "explicitRemovedUnitCount",
      ] as const) {
        const n = decision.finalFields[key];
        const ev = decision.finalFields.countEvidence[key];
        lines.push(
          `- ${COUNT_LABELS[key]}: ${n == null ? "Unknown" : n}${ev ? ` — “${ev.quote}”` : ""}`,
        );
      }
      if (decision.finalFields.unsourcedNotes.length) {
        lines.push(`- Reviewer notes (not sourced counts): ${decision.finalFields.unsourcedNotes.join("; ")}`);
      }
    }
    if (decision.reason) lines.push(`- Reason: ${decision.reason}`);
    lines.push(`- Source text: ${record.workDescriptionSanitized || "(blank)"}`);
    lines.push("");
  }
  lines.push("Open questions / next verification");
  lines.push("- Municipal data analyst: reconcile duplicate/phase records that may describe the same project.");
  lines.push("- City permit/inspection staff: verify current construction or occupancy status; an issued or 'Completed' source status is not proof of occupied homes.");
  lines.push(`- Official record lookup: ${"https://www.pittsburghpa.gov/Business-Development/Permits-Licenses-and-Inspections/OneStopPGH-Permit-Center"}`);
  lines.push("");
  lines.push("Limitations");
  lines.push("- A permit record is not a housing unit. This briefing contains no aggregate homes-built total.");
  lines.push("- Candidate selection can miss housing language and can include non-housing work.");
  lines.push("- Commercial administrative class can include housing; Residential class does not prove new units.");
  lines.push("- Local reviews stay in this browser unless exported; they do not change City data.");
  lines.push(DECISION_SUPPORT);
  return lines.join("\n");
}

export function briefingCsv(
  records: ClientPermit[],
  reviews: Record<string, ReviewDecision>,
): string {
  const headers = [
    "sourcePermitId",
    "issueDate",
    "neighborhood",
    "sourceClassRaw",
    "reviewState",
    "reviewOrigin",
    "reviewer",
    "housingRelevance",
    "proposedScope",
    "existingUnitCount",
    "proposedTotalUnitCount",
    "explicitAddedUnitCount",
    "explicitRemovedUnitCount",
    "proposedUnitEvidence",
    "reason",
    "citationId",
    "workDescriptionSanitized",
  ];
  const rows = records
    .map((record) => {
      const decision = reviews[record.recordId];
      if (!decision || decision.state === "unreviewed") return null;
      const fields = decision.finalFields;
      return [
        record.sourcePermitId,
        record.issueDate,
        record.neighborhood,
        record.sourceClassRaw,
        decision.state,
        decision.origin,
        reviewerLabel(decision.reviewerRole),
        fields?.housingRelevance ?? "",
        fields?.proposedScope ?? "",
        fields?.existingUnitCount ?? "",
        fields?.proposedTotalUnitCount ?? "",
        fields?.explicitAddedUnitCount ?? "",
        fields?.explicitRemovedUnitCount ?? "",
        fields?.countEvidence.proposedTotalUnitCount?.quote ?? "",
        decision.reason,
        record.citationId,
        record.workDescriptionSanitized,
      ];
    })
    .filter((row): row is Array<string | number> => row != null);
  return toCsv(headers, rows);
}
