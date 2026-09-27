import { readFileSync, existsSync } from "node:fs";
import { PROMPT_VERSION, SCHEMA_VERSION, SNAPSHOT_VERSION } from "./constants";
import { buildDemoProposal } from "./demoExtraction";
import { EXTRACTION_SYSTEM_PROMPT, validateProposal } from "./extraction";
import { sanitizedInputHash } from "./hash";
import { allowlistedForExtraction, savedExtractionsPath } from "./loadSnapshot";
import type { AiMode, ExtractionProposal, PermitRecord } from "./types";

export type SavedExample = ExtractionProposal;

export function readSavedExamples(): SavedExample[] {
  const path = savedExtractionsPath();
  if (!existsSync(path)) return [];
  const parsed = JSON.parse(readFileSync(path, "utf8")) as SavedExample[];
  return Array.isArray(parsed) ? parsed : [];
}

export function currentAiMode(): AiMode {
  const configured = (process.env.HOMESIGNAL_AI_MODE || "").trim();
  if (configured === "live" || configured === "saved" || configured === "source-review") {
    if (configured === "live" && !process.env.EXTRACTION_API_KEY) return "source-review";
    return configured;
  }
  if (process.env.EXTRACTION_API_KEY) return "live";
  if (readSavedExamples().length > 0) return "saved";
  return "source-review";
}

export function modeDescription(mode: AiMode): string {
  const runtime =
    "Cursor, Grok, and other coding assistants are not used at runtime. Queue totals come from the local snapshot; reviews are human-entered.";
  if (mode === "live") {
    return `Live AI extraction is enabled for the small review-corpus allowlist. ${runtime}`;
  }
  if (mode === "saved") {
    return `New paid generation is disabled. Previously generated responses may replay with their original timestamp. ${runtime}`;
  }
  return `No runtime model key is configured. Review-corpus records can show a labeled synthetic demo extraction, and any record can run a simulated evidence brief. Neither is a live vendor model call, and neither is mixed into citywide permit metrics. Displayed findings remain deterministic snapshot metrics or human-entered reviews. ${runtime}`;
}

async function callProvider(record: PermitRecord, inputHash: string): Promise<unknown> {
  const key = process.env.EXTRACTION_API_KEY;
  const model = process.env.EXTRACTION_MODEL;
  const base = (process.env.EXTRACTION_API_BASE || "https://api.openai.com/v1").replace(/\/$/, "");
  if (!key || !model) {
    throw new Error("NO_KEY");
  }
  const userPayload = {
    recordId: record.recordId,
    snapshotVersion: record.snapshotVersion,
    citationId: record.citationId,
    issueDate: record.issueDate,
    permitTypeRaw: record.permitTypeRaw,
    sourceClassRaw: record.sourceClassRaw,
    workTypeRaw: record.workTypeRaw,
    sourceStatusRaw: record.sourceStatusRaw,
    neighborhood: record.neighborhood,
    workDescriptionSanitized: record.workDescriptionSanitized,
    sanitizedInputHash: inputHash,
    schemaVersion: SCHEMA_VERSION,
    promptVersion: PROMPT_VERSION,
  };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        temperature: 0,
        response_format: { type: "json_object" },
        max_tokens: 1200,
        messages: [
          { role: "system", content: EXTRACTION_SYSTEM_PROMPT },
          { role: "user", content: JSON.stringify(userPayload) },
        ],
      }),
    });
    if (response.status === 429) throw new Error("RATE_LIMIT");
    if (!response.ok) throw new Error(`PROVIDER_${response.status}`);
    const body = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = body.choices?.[0]?.message?.content;
    if (!content) throw new Error("EMPTY_CONTENT");
    return JSON.parse(content);
  } finally {
    clearTimeout(timer);
  }
}

export async function extractForRecord(
  record: PermitRecord,
  options: { replaySaved?: boolean } = {},
): Promise<
  | { status: "ok"; proposal: ExtractionProposal }
  | { status: "unavailable"; message: string }
> {
  const inputHash = sanitizedInputHash(record);
  const mode = currentAiMode();
  if (!allowlistedForExtraction(record) && mode === "live") {
    return {
      status: "unavailable",
      message: "Live AI extraction is limited to the small sanitized review corpus. Source review still works.",
    };
  }
  const saved = readSavedExamples().find(
    (item) =>
      item.targetRecordId === record.recordId &&
      item.sanitizedInputHash === inputHash &&
      item.snapshotVersion === SNAPSHOT_VERSION,
  );
  if (mode !== "live" || options.replaySaved) {
    if (saved) {
      const checked = validateProposal(record, inputHash, {
        ...saved,
        originLabel: "previously_generated",
      });
      if (checked.ok) return { status: "ok", proposal: checked.value };
    }
    if (mode === "source-review") {
      const demo = buildDemoProposal(record, inputHash);
      if (demo.ok) return { status: "ok", proposal: demo.value };
      return {
        status: "unavailable",
        message: `Labeled demo extraction could not be validated for this record (${demo.error}). Source review still works. No live model was called.`,
      };
    }
    if (mode !== "live") {
      return {
        status: "unavailable",
        message:
          "AI extraction unavailable; source review still works. No runtime model key is configured, and no validated saved response exists for this record.",
      };
    }
  }

  let lastError = "unknown";
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const raw = (await callProvider(record, inputHash)) as Record<string, unknown>;
      const proposalAttempt = {
        ...raw,
        targetRecordId: record.recordId,
        sanitizedInputHash: inputHash,
        snapshotVersion: SNAPSHOT_VERSION,
        modelId: String(raw.modelId ?? process.env.EXTRACTION_MODEL ?? "unknown"),
        promptVersion: PROMPT_VERSION,
        schemaVersion: SCHEMA_VERSION,
        generatedAt: new Date().toISOString(),
        originLabel: "live",
      };
      const checked = validateProposal(record, inputHash, proposalAttempt);
      if (checked.ok) return { status: "ok", proposal: checked.value };
      lastError = checked.error;
    } catch (error) {
      const name = error instanceof Error ? error.message : "PROVIDER_ERROR";
      if (name === "NO_KEY") {
        return {
          status: "unavailable",
          message: "AI extraction unavailable; source review still works. No runtime API key is configured.",
        };
      }
      lastError = name;
      if (name !== "RATE_LIMIT" && !name.includes("abort") && attempt === 0) {
        continue;
      }
      if (name === "RATE_LIMIT" || name.includes("abort")) {
        if (attempt === 0) continue;
      }
    }
  }
  return {
    status: "unavailable",
    message: `AI extraction unavailable; source review still works. (${lastError})`,
  };
}
