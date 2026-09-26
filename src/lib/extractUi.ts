import type { AiMode } from "./types";

export const SOURCE_REVIEW_STATUS =
  "AI extraction is not configured on this deployment: there is no runtime model key, and no saved genuine model response for this record. This is not a live request. Manual source review below still works.";

export function shouldCallExtractionApi(mode: AiMode): boolean {
  return mode === "live" || mode === "saved";
}

export function extractionButtonLabel(mode: AiMode, waiting: boolean): string {
  if (mode === "source-review") return "Why AI extraction is unavailable";
  if (waiting) return "Waiting for the model (up to 15 seconds)…";
  if (mode === "saved") return "Look up a saved extraction";
  return "Ask AI to extract evidence";
}

export function countsAsFailedLiveExtraction(mode: AiMode, status: string): boolean {
  return mode === "live" && status !== "ok";
}
