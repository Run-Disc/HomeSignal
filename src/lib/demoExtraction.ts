import {
  DEMO_EXTRACT_GENERATED_AT,
  DEMO_EXTRACT_MODEL_ID,
  PROMPT_VERSION,
  SCHEMA_VERSION,
  SNAPSHOT_VERSION,
} from "./constants";
import { validateProposal } from "./extraction";
import type { EvidenceSpan, ExtractionProposal, HousingRelevance, PermitRecord, ProposedScope } from "./types";

const HOUSING_QUOTES = [
  "DWELLING UNITS",
  "DWELLING UNIT",
  "UNIT DWELLINGS",
  "APARTMENT BUILDING",
  "APARTMENTS",
  "APARTMENT",
  "RESIDENTIAL",
  "HOUSING",
  "TOWNHOUSE",
  "TOWNHOME",
  "CONDOMINIUM",
  "ACCESSORY DWELLING",
];

function quoteIn(
  text: string,
  needle: string,
  field: EvidenceSpan["field"],
  interpretation: string,
): EvidenceSpan | null {
  if (!text) return null;
  const idx = text.toUpperCase().indexOf(needle.toUpperCase());
  if (idx === -1) return null;
  const quote = text.slice(idx, idx + needle.length);
  return { field, quote, start: idx, end: idx + quote.length, interpretation };
}

function classifyHousing(record: PermitRecord): {
  housingRelevance: HousingRelevance;
  evidence: EvidenceSpan | null;
} {
  const desc = record.workDescriptionSanitized || "";
  for (const needle of HOUSING_QUOTES) {
    const evidence = quoteIn(desc, needle, "workDescriptionSanitized", "housing language in the public description");
    if (evidence) return { housingRelevance: "housing", evidence };
  }
  return { housingRelevance: "uncertain", evidence: null };
}

function classifyScope(record: PermitRecord): {
  proposedScope: ProposedScope;
  evidence: EvidenceSpan | null;
} {
  const desc = (record.workDescriptionSanitized || "").toUpperCase();
  if (desc.includes("NO WORK")) {
    return { proposedScope: "uncertain", evidence: null };
  }
  const descHits: Array<{ needle: string; scope: ProposedScope; interpretation: string }> = [
    { needle: "DEMOLITION", scope: "demolition", interpretation: "demolition language" },
    { needle: "DEMOLISH", scope: "demolition", interpretation: "demolition language" },
    { needle: "CHANGE OCCUPANCY", scope: "conversion", interpretation: "occupancy-change language" },
    { needle: "CHANGE OF USE", scope: "conversion", interpretation: "change-of-use language" },
    { needle: "CONVERT", scope: "conversion", interpretation: "conversion language" },
    { needle: "NEW BUILDING", scope: "new_building", interpretation: "new-building language" },
    { needle: "NEW CONSTRUCTION", scope: "new_building", interpretation: "new-construction language" },
    { needle: "CONSTRUCT A NEW", scope: "new_building", interpretation: "new-construction language" },
    { needle: "ALTERATION", scope: "addition_or_alteration", interpretation: "alteration language" },
    { needle: "RENOVATION", scope: "addition_or_alteration", interpretation: "renovation language" },
    { needle: "ADDITION", scope: "addition_or_alteration", interpretation: "addition language" },
  ];
  for (const hit of descHits) {
    const evidence = quoteIn(
      record.workDescriptionSanitized || "",
      hit.needle,
      "workDescriptionSanitized",
      hit.interpretation,
    );
    if (evidence) return { proposedScope: hit.scope, evidence };
  }
  const workHits: Array<{ needle: string; scope: ProposedScope; interpretation: string }> = [
    { needle: "DEMOLITION", scope: "demolition", interpretation: "work-type demolition token" },
    { needle: "CONVERSION", scope: "conversion", interpretation: "work-type conversion token" },
    { needle: "CHANGE OF USE", scope: "conversion", interpretation: "work-type change-of-use token" },
    { needle: "NEW CONSTRUCTION", scope: "new_building", interpretation: "work-type new-construction token" },
  ];
  for (const hit of workHits) {
    const evidence = quoteIn(record.workTypeRaw || "", hit.needle, "workTypeRaw", hit.interpretation);
    if (evidence) return { proposedScope: hit.scope, evidence };
  }
  return { proposedScope: "uncertain", evidence: null };
}

function dwellingCountEvidence(record: PermitRecord): {
  field: "existingUnitCount" | "proposedTotalUnitCount";
  count: number;
  evidence: EvidenceSpan;
} | null {
  const text = record.workDescriptionSanitized || "";
  const match = text.match(/\b(\d+)\s+DWELLING UNITS?\b/i);
  if (!match || match.index == null) return null;
  const count = Number(match[1]);
  if (!Number.isSafeInteger(count)) return null;
  const quote = match[0];
  const prefix = text.slice(Math.max(0, match.index - 40), match.index).toUpperCase();
  const existing = /\bEXISTING\b/.test(prefix);
  return {
    field: existing ? "existingUnitCount" : "proposedTotalUnitCount",
    count,
    evidence: {
      field: "workDescriptionSanitized",
      quote,
      start: match.index,
      end: match.index + quote.length,
      interpretation: existing
        ? "digit immediately before dwelling unit(s), near existing"
        : "digit immediately before dwelling unit(s) in the public description",
    },
  };
}

export function buildDemoProposal(
  record: PermitRecord,
  inputHash: string,
): { ok: true; value: ExtractionProposal } | { ok: false; error: string } {
  const housing = classifyHousing(record);
  const scope = classifyScope(record);
  const count = dwellingCountEvidence(record);
  const missingEvidence: string[] = [];
  if (!housing.evidence) missingEvidence.push("No explicit housing phrase was matched in this description.");
  if (!scope.evidence) missingEvidence.push("No explicit work-scope phrase was matched.");
  if (!count) missingEvidence.push("No explicit “N DWELLING UNIT(S)” phrase was matched, so counts stay unknown.");

  const raw = {
    targetRecordId: record.recordId,
    sanitizedInputHash: inputHash,
    snapshotVersion: SNAPSHOT_VERSION,
    housingRelevance: housing.housingRelevance,
    proposedScope: scope.proposedScope,
    existingUnitCount: count?.field === "existingUnitCount" ? count.count : null,
    proposedTotalUnitCount: count?.field === "proposedTotalUnitCount" ? count.count : null,
    explicitAddedUnitCount: null,
    explicitRemovedUnitCount: null,
    countEvidence: count ? { [count.field]: count.evidence } : {},
    classificationEvidence: {
      housingRelevance: housing.evidence,
      proposedScope: scope.evidence,
    },
    explanation:
      "SYNTHETIC DEMO FIXTURE — no live model was called. A deterministic quote matcher filled only fields with an exact excerpt from this record. Bedroom, story, parking, and accessibility-unit numbers are ignored. This is a workflow demonstration, not model output, and it is not a City determination.",
    missingEvidence,
    followUpRole: "City permit/inspection staff",
    followUpQuestion:
      "Does the official record still match this issued description, and has any later inspection or occupancy status been recorded?",
    modelId: DEMO_EXTRACT_MODEL_ID,
    promptVersion: PROMPT_VERSION,
    schemaVersion: SCHEMA_VERSION,
    generatedAt: DEMO_EXTRACT_GENERATED_AT,
    originLabel: "synthetic_demo" as const,
  };

  return validateProposal(record, inputHash, raw);
}
