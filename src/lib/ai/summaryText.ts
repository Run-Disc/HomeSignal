import type { PermitRecord, ReviewDecision } from "../types";
import type { RuntimeAiSuccess } from "./schema";

export function buildRecordSummaryText(input: {
  record: PermitRecord;
  brief: RuntimeAiSuccess | null;
  review: ReviewDecision | null;
  reviewLabel: string;
}): string {
  const { record, brief, review, reviewLabel } = input;
  const lines: string[] = [
    `HomeSignal record summary — ${record.sourcePermitId}`,
    `Citation: ${record.citationId} · Snapshot ${record.snapshotVersion}`,
    `Issued ${record.issueDate} · ${record.neighborhood} · ${record.workTypeRaw ?? "work type not listed"}`,
    "",
    `Reviewer status: ${reviewLabel}`,
  ];

  const count = review?.finalFields?.proposedTotalUnitCount;
  const quote = review?.finalFields?.countEvidence.proposedTotalUnitCount?.quote;
  if (review?.finalFields && count != null && quote) {
    lines.push(`Reviewed fact: ${count} dwelling units referenced in the permit description (“${quote}”).`);
  }
  if (review?.reason) lines.push(`Reviewer note: ${review.reason}`);

  if (brief) {
    const ds = brief.brief.decisionSupport;
    lines.push(
      "",
      `SIMULATED AI INTERPRETATION — non-authoritative (${brief.model}, request ${brief.requestId}). No external model was called.`,
      "",
      "What this record establishes:",
      ...ds.establishes.map((s) => `- ${s}`),
      "",
      "What this record does not establish:",
      ...ds.doesNotEstablish.map((s) => `- ${s}`),
      "",
      "What to verify next:",
      ...ds.verifyNext.map((s) => `- ${s}`),
    );
  }

  lines.push(
    "",
    "An issued permit is not construction start, completion, or occupancy. Decision support only; not legal, zoning, or permitting advice.",
  );
  return lines.join("\n");
}
