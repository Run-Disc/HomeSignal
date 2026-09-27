import type { ClientPermit, CountField, EvidenceSpan, ReviewDecision, ReviewedFields } from "./types";
import { COUNT_LABELS } from "./constants";

export type CountCorrectionInput = {
  draft: ReviewedFields;
  countKey: CountField;
  countValue: string;
  quote: string;
  sourceText: string;
  reason: string;
};

export type CountCorrectionResult =
  | { ok: true; fields: ReviewedFields; sourced: boolean }
  | { ok: false; error: string; field: "quote" | "countVal" };

export function parseCountValue(raw: string): { ok: true; value: number | null } | { ok: false; error: string } {
  const trimmed = raw.trim();
  if (trimmed === "") return { ok: true, value: null };
  if (!/^\d+$/.test(trimmed)) {
    return { ok: false, error: "Count must be a nonnegative whole number, or left blank for unknown." };
  }
  const value = Number(trimmed);
  if (!Number.isSafeInteger(value)) return { ok: false, error: "Count is too large to store accurately. Check the source." };
  return { ok: true, value };
}

export function exactQuoteIndex(sourceText: string, quote: string): number {
  if (!quote) return -1;
  return sourceText.indexOf(quote);
}

/** A numeric count becomes sourced only when the exact excerpt is present in the description. */
export function applyCountCorrection(input: CountCorrectionInput): CountCorrectionResult {
  const parsed = parseCountValue(input.countValue);
  if (!parsed.ok) return { ok: false, error: parsed.error, field: "countVal" };

  const fields: ReviewedFields = {
    ...input.draft,
    countEvidence: { ...input.draft.countEvidence },
    unsourcedNotes: [...input.draft.unsourcedNotes],
  };

  if (parsed.value == null) {
    fields[input.countKey] = null;
    delete fields.countEvidence[input.countKey];
    return { ok: true, fields, sourced: false };
  }

  const idx = exactQuoteIndex(input.sourceText, input.quote);
  if (idx === -1) {
    return {
      ok: false,
      error:
        "That count is not sourced. Paste an exact excerpt from the work description that contains the number, or leave the count blank and use Insufficient evidence.",
      field: "quote",
    };
  }

  const evidence: EvidenceSpan = {
    field: "workDescriptionSanitized",
    quote: input.quote,
    start: idx,
    end: idx + input.quote.length,
    interpretation: input.reason || "Reviewer-selected excerpt",
  };
  fields.countEvidence[input.countKey] = evidence;
  fields[input.countKey] = parsed.value;
  return { ok: true, fields, sourced: true };
}

export function unsourcedCountNote(countKey: CountField, value: number): string {
  return `${COUNT_LABELS[countKey]} ${value} recorded as a reviewer note without matching source excerpt.`;
}

/** A review belongs to the exact source snapshot the person inspected. */
export function currentReviewsForRecords(records: ClientPermit[], reviews: Record<string, ReviewDecision>): Record<string, ReviewDecision> {
  return Object.fromEntries(records.flatMap((record) => {
    const decision = reviews[record.recordId];
    return decision && decision.recordId === record.recordId && decision.snapshotVersion === record.snapshotVersion &&
      decision.sanitizedInputHash === record.inputHash ? [[record.recordId, decision]] : [];
  }));
}
