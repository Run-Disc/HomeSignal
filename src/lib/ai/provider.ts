import type { ExtractionProposal, PermitRecord } from "../types";
import type { FollowUpQuestionId, RuntimeAiError, RuntimeAiSuccess, RuntimeAskSuccess } from "./schema";

export type ProviderOptions = {
  delayMs?: number;
  fail?: boolean;
};

export interface RuntimeAiProvider {
  readonly id: "demo";
  readonly modelLabel: string;
  extract(
    record: PermitRecord,
    inputHash: string,
    options?: ProviderOptions,
  ): Promise<{ status: "ok"; proposal: ExtractionProposal } | { status: "unavailable"; message: string }>;
  analyze(
    record: PermitRecord,
    inputHash: string,
    options?: ProviderOptions,
  ): Promise<RuntimeAiSuccess | RuntimeAiError>;
  answer(
    record: PermitRecord,
    inputHash: string,
    questionId: FollowUpQuestionId,
    options?: ProviderOptions,
  ): Promise<RuntimeAskSuccess | RuntimeAiError>;
}

export function estimateTokens(text: string): number {
  return Math.max(1, Math.ceil(text.length / 4));
}

export function demoRequestId(parts: string[]): string {
  const raw = parts.join(":");
  let hash = 2166136261;
  for (let i = 0; i < raw.length; i += 1) {
    hash ^= raw.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `demo_req_${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

export async function simulateLatency(seed: string, options?: ProviderOptions): Promise<number> {
  if (options?.delayMs === 0) return 0;
  const n = Number.parseInt(seed.replace(/[^0-9a-f]/gi, "").slice(0, 6) || "0", 16);
  const ms = options?.delayMs ?? 700 + (Number.isFinite(n) ? n % 400 : 0);
  const started = Date.now();
  await new Promise((resolve) => setTimeout(resolve, ms));
  return Date.now() - started;
}
