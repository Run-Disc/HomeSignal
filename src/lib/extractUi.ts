import type { AiMode, ExtractionProposal, ReviewOrigin, ReviewState } from "./types";

export type ReviewChipTone = "pending" | "human" | "excluded";

export function reviewStatusChip(
  state: ReviewState | null | undefined,
  hasProposal: boolean,
): { label: string; tone: ReviewChipTone } {
  switch (state) {
    case "accepted":
      return { label: "Accepted by reviewer", tone: "human" };
    case "corrected":
      return { label: "Corrected by reviewer", tone: "human" };
    case "source_reviewed":
      return { label: "Reviewed from source by a person", tone: "human" };
    case "rejected":
      return { label: "Rejected by reviewer", tone: "excluded" };
    case "insufficient_evidence":
      return { label: "Reviewer marked insufficient evidence", tone: "excluded" };
    default:
      return hasProposal
        ? { label: "Extracted — review required", tone: "pending" }
        : { label: "Not reviewed", tone: "pending" };
  }
}

export const SOURCE_REVIEW_STATUS =
  "No runtime model key is configured. You can extract labeled demo evidence on review-corpus records and run a simulated AI brief on this record. Those outputs are not live vendor results.";

export function shouldCallExtractionApi(mode: AiMode): boolean {
  return mode === "live" || mode === "saved" || mode === "source-review";
}

export function extractionButtonLabel(mode: AiMode, waiting: boolean): string {
  if (waiting) {
    return mode === "source-review"
      ? "Preparing labeled demo extraction…"
      : "Waiting for the model (up to 15 seconds)…";
  }
  if (mode === "source-review") return "Extract demo evidence";
  if (mode === "saved") return "Look up a saved extraction";
  return "Ask AI to extract evidence";
}

export function countsAsFailedLiveExtraction(mode: AiMode, status: string): boolean {
  return mode === "live" && status !== "ok";
}

export function proposalStatusLabel(proposal: ExtractionProposal): string {
  if (proposal.originLabel === "synthetic_demo") {
    return `Labeled synthetic demo extraction · ${proposal.modelId} · not a live model result`;
  }
  if (proposal.originLabel === "previously_generated") {
    return `Previously generated ${proposal.generatedAt} · ${proposal.modelId}`;
  }
  return `Live extraction ${proposal.generatedAt} · ${proposal.modelId}`;
}

export function reviewOriginFromProposal(proposal: ExtractionProposal | null): ReviewOrigin {
  if (!proposal) return "manual_source_review";
  if (proposal.originLabel === "synthetic_demo") return "demo_extraction_review";
  return "ai_assisted_review";
}
