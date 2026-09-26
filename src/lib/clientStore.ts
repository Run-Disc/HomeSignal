import type { ExtractionProposal, ReviewDecision } from "./types";
import { EXTRACTION_CACHE_KEY, FAILED_EXTRACTION_KEY, REVIEW_STORAGE_KEY, SNAPSHOT_VERSION } from "./constants";

export function loadReviews(): Record<string, ReviewDecision> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(REVIEW_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as { snapshotVersion?: string; reviews?: Record<string, ReviewDecision> };
    if (parsed.snapshotVersion !== SNAPSHOT_VERSION || !parsed.reviews) return {};
    return parsed.reviews;
  } catch {
    return {};
  }
}

export function saveReviews(reviews: Record<string, ReviewDecision>): void {
  window.localStorage.setItem(
    REVIEW_STORAGE_KEY,
    JSON.stringify({ snapshotVersion: SNAPSHOT_VERSION, reviews }),
  );
}

export function loadFailedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(FAILED_EXTRACTION_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function saveFailedIds(ids: string[]): void {
  window.localStorage.setItem(FAILED_EXTRACTION_KEY, JSON.stringify(ids));
}

export function loadCachedProposal(recordId: string, inputHash: string): ExtractionProposal | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(EXTRACTION_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, ExtractionProposal>;
    const hit = parsed[`${recordId}:${inputHash}`];
    return hit ?? null;
  } catch {
    return null;
  }
}

export function saveCachedProposal(proposal: ExtractionProposal): void {
  const raw = window.localStorage.getItem(EXTRACTION_CACHE_KEY);
  const parsed = raw ? (JSON.parse(raw) as Record<string, ExtractionProposal>) : {};
  parsed[`${proposal.targetRecordId}:${proposal.sanitizedInputHash}`] = proposal;
  window.localStorage.setItem(EXTRACTION_CACHE_KEY, JSON.stringify(parsed));
}

export function resetLocalState(): void {
  window.localStorage.removeItem(REVIEW_STORAGE_KEY);
  window.localStorage.removeItem(EXTRACTION_CACHE_KEY);
  window.localStorage.removeItem(FAILED_EXTRACTION_KEY);
}
