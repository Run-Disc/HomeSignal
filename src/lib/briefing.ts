import { COUNT_LABELS, DECISION_SUPPORT, FLAGSHIP_PERMIT_ID, ONESTOP, SCOPE_LABELS, SOURCE_RESOURCE } from "./constants";
import { currentReviewsForRecords } from "./reviewLogic";
import { toCsv } from "./csv";
import type { ClientPermit, Filters, MetricSet, ReviewDecision } from "./types";

export function reviewerLabel(role: ReviewDecision["reviewerRole"]): string {
  return role === "prototype_builder" ? "Prototype review by project builder" : "Your local review";
}

function reviewedPairs(
  records: ClientPermit[],
  reviews: Record<string, ReviewDecision>,
): Array<{ record: ClientPermit; decision: ReviewDecision }> {
  const current = currentReviewsForRecords(records, reviews);
  return records
    .map((record) => ({ record, decision: current[record.recordId] }))
    .filter((x): x is { record: ClientPermit; decision: ReviewDecision } =>
      Boolean(x.decision && x.decision.state !== "unreviewed"),
    );
}

function decisionBlock(record: ClientPermit, decision: ReviewDecision): string[] {
  const lines: string[] = [];
  lines.push(`Permit ${record.sourcePermitId} (${record.neighborhood}, ${record.issueDate})`);
  lines.push(`- Source class: ${record.sourceClassRaw ?? "Unknown"} (administrative label)`);
  lines.push(`- Citation: ${record.citationId}`);
  lines.push(`- Snapshot: ${record.snapshotVersion}`);
  lines.push(
    `- Decision: ${decision.state.replaceAll("_", " ")}; ${reviewerLabel(decision.reviewerRole)}; ${decision.origin}; ${decision.timestamp}`,
  );
  if (decision.finalFields) {
    lines.push(
      `- Relevance: ${SCOPE_LABELS[decision.finalFields.housingRelevance] ?? decision.finalFields.housingRelevance}`,
    );
    lines.push(`- Scope: ${SCOPE_LABELS[decision.finalFields.proposedScope] ?? decision.finalFields.proposedScope}`);
    for (const key of [
      "existingUnitCount",
      "proposedTotalUnitCount",
      "explicitAddedUnitCount",
      "explicitRemovedUnitCount",
    ] as const) {
      const n = decision.finalFields[key];
      const ev = decision.finalFields.countEvidence[key];
      lines.push(`- ${COUNT_LABELS[key]}: ${n == null ? "Unknown" : n}${ev ? ` — “${ev.quote}”` : ""}`);
    }
    if (decision.finalFields.unsourcedNotes.length) {
      lines.push(`- Reviewer notes (not sourced counts): ${decision.finalFields.unsourcedNotes.join("; ")}`);
    }
  }
  if (decision.reason) lines.push(`- Reason / follow-up: ${decision.reason}`);
  const quote =
    decision.finalFields?.countEvidence.proposedTotalUnitCount?.quote ||
    decision.finalFields?.countEvidence.existingUnitCount?.quote ||
    "";
  if (quote) lines.push(`- Exact source quote used for a count: “${quote}”`);
  lines.push(`- Source text: ${record.workDescriptionSanitized || "(blank)"}`);
  return lines;
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
  featuredRecordId?: string | null;
}): string {
  const {
    preparedAt,
    filters,
    metrics,
    snapshotVersion,
    snapshotHash,
    sourceUpdateDate,
    mode,
    records,
    reviews,
    featuredRecordId,
  } = args;
  const reviewed = reviewedPairs(records, reviews);
  const featured = featuredRecordId
    ? reviewed.find((x) => x.record.recordId === featuredRecordId)
    : undefined;
  const featuredUnreviewed =
    featuredRecordId && !featured
      ? records.find((r) => r.recordId === featuredRecordId) ?? null
      : null;

  const lines: string[] = [];
  lines.push("HomeSignal briefing");
  lines.push(`Prepared: ${preparedAt}`);
  lines.push(`Source snapshot: ${snapshotVersion} (sha256 ${snapshotHash})`);
  lines.push(`WPRDC resource last_modified: ${sourceUpdateDate}`);
  lines.push(`Source: City of Pittsburgh PLI Permits via WPRDC (Creative Commons Attribution): ${SOURCE_RESOURCE}`);
  lines.push(`AI mode: ${mode}`);
  lines.push("");
  lines.push("Export scope (this briefing)");
  lines.push(`- Issue year: ${filters.year}`);
  lines.push(`- Neighborhood: ${filters.neighborhood}`);
  lines.push(`- Review state filter: ${filters.reviewState}`);
  lines.push(`- Search: ${filters.search?.trim() || "none"}`);
  lines.push(`- Table universe: ${filters.candidatesOnly ? "potential housing candidates" : "full selected cohort"}`);
  lines.push(
    "- CSV and the reviewed-evidence section include local reviews only. Unreviewed candidates are not listed as findings.",
  );
  lines.push("");
  lines.push("Selected cohort denominators (issued permit records, not homes built)");
  lines.push(`- Permit records in selected cohort: ${metrics.permitRecordsInCohort}`);
  lines.push(
    `- Potential housing records (keyword/work-type discovery aid): ${metrics.potentialHousingRecords}`,
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
  lines.push("Monthly issued-record activity (issue_date month; not housing production)");
  for (const row of metrics.monthlyIssued) {
    lines.push(`- ${row.month}: ${row.count} issued records`);
  }
  lines.push("");
  lines.push("Reviewed example");
  if (featured) {
    lines.push(...decisionBlock(featured.record, featured.decision));
  } else if (featuredUnreviewed) {
    lines.push(
      `Permit ${featuredUnreviewed.sourcePermitId} is in this snapshot but has no local review yet. It is not a finding.`,
    );
    lines.push(`- Citation: ${featuredUnreviewed.citationId}`);
    lines.push(`- Source text: ${featuredUnreviewed.workDescriptionSanitized || "(blank)"}`);
  } else {
    lines.push(
      `No featured reviewed example in this export. The flagship ID ${FLAGSHIP_PERMIT_ID} is available on Overview if you want to review it first.`,
    );
  }
  lines.push("");
  lines.push("Other local reviewed evidence");
  const others = reviewed.filter((x) => !featured || x.record.recordId !== featured.record.recordId);
  if (others.length === 0) {
    lines.push("No additional local reviews in the current export filter.");
  }
  for (const row of others) {
    lines.push(...decisionBlock(row.record, row.decision));
    lines.push("");
  }
  lines.push("Explicit unknowns");
  lines.push("- Construction start, completion, inspection pass, and occupancy are unknown from this snapshot.");
  lines.push("- Whether multiple permit IDs describe one building is unknown.");
  lines.push("- Candidate exclusion is not proof of no housing.");
  lines.push("");
  lines.push("Next verification");
  lines.push("- Responsible role: City permit/inspection staff or a municipal housing analyst.");
  lines.push(
    "- Question: Does the official record still match this issued description, and has any later inspection or occupancy status been recorded?",
  );
  lines.push(`- Official lookup: ${ONESTOP}`);
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
  const current = currentReviewsForRecords(records, reviews);
  const headers = [
    "sourcePermitId",
    "issueDate",
    "neighborhood",
    "sourceClassRaw",
    "reviewState",
    "reviewOrigin",
    "reviewer",
    "reviewTimestamp",
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
    "existingUnitEvidence",
    "addedUnitEvidence",
    "removedUnitEvidence",
    "snapshotVersion",
    "sourceInputHash",
    "sourceDatasetUrl",
  ];
  const rows = records
    .map((record) => {
      const decision = current[record.recordId];
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
        decision.timestamp,
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
        fields?.countEvidence.existingUnitCount?.quote ?? "",
        fields?.countEvidence.explicitAddedUnitCount?.quote ?? "",
        fields?.countEvidence.explicitRemovedUnitCount?.quote ?? "",
        record.snapshotVersion,
        record.inputHash,
        SOURCE_RESOURCE,
      ];
    })
    .filter((row): row is Array<string | number> => row != null);
  return toCsv(headers, rows);
}
