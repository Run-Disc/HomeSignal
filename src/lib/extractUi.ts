import type { AiMode } from "./types";

export const SOURCE_REVIEW_STATUS =
  "Source-review mode is active. Decisions come from your review of the public description; optional AI extraction is disabled for this demo.";

export function shouldCallExtractionApi(mode: AiMode): boolean {
  return mode === "live" || mode === "saved";
}

export function extractionButtonLabel(mode: AiMode, waiting: boolean): string {
  if (mode === "source-review") return "Extraction status";
  if (waiting) return "Waiting for the model (up to 15 seconds)…";
  if (mode === "saved") return "Look up a saved extraction";
  return "Ask AI to extract evidence";
}

export function countsAsFailedLiveExtraction(mode: AiMode, status: string): boolean {
  return mode === "live" && status !== "ok";
}
