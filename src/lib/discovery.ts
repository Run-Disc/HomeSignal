import type { PermitRecord } from "./types";

/** Same documented keyword list as `scripts/ingest_pli.py`. Discovery aid only. */
export const CANDIDATE_KEYWORDS = [
  "DWELLING",
  "RESIDENTIAL",
  "APARTMENT",
  "APARTMENTS",
  "MULTI-FAMILY",
  "MULTIFAMILY",
  "MULTI FAMILY",
  "MIXED USE",
  "MIXED-USE",
  "CONDO",
  "CONDOMINIUM",
  "TOWNHOUSE",
  "TOWNHOME",
  "HOUSING",
  "UNITS",
  "UNIT ",
  " UNIT",
  "BEDROOM",
  "SINGLE-FAMILY",
  "SINGLE FAMILY",
  "TWO-FAMILY",
  "TWO FAMILY",
  "THREE-FAMILY",
  "FOUR-FAMILY",
  "DUPLEX",
  "TRIPLEX",
  "CONVERSION",
  "CHANGE OF USE",
  "CHANGE-OF-USE",
  "NEW CONSTRUCTION",
  "NEW BUILDING",
  "NEW 3-STORY",
  "NEW 2-STORY",
  "NEW TWO",
  "NEW THREE",
  "ACCESSORY DWELLING",
  "ADU",
  "LIVE/WORK",
  "LIVE-WORK",
  "ROOMING",
  "BOARDING",
] as const;

export const STRUCTURED_WORK_TYPE_TOKENS = ["NEW", "CONVERSION", "CHANGE OF USE", "DEMOLITION"] as const;

export type DiscoveryExplanation = {
  selected: boolean;
  keywordHits: string[];
  workTypeHits: string[];
  summary: string;
  caveat: string;
};

export const DISCOVERY_CAVEAT =
  "This discovery aid can miss housing language and can include false positives. It is not model output and is not a complete housing-permit inventory.";

export function explainDiscovery(
  record: Pick<PermitRecord, "workDescriptionSanitized" | "workTypeRaw" | "candidateDiscovery">,
): DiscoveryExplanation {
  const desc = (record.workDescriptionSanitized || "").toUpperCase();
  const workType = (record.workTypeRaw || "").toUpperCase();
  const keywordHits = CANDIDATE_KEYWORDS.filter((k) => desc.includes(k));
  const workTypeHits = STRUCTURED_WORK_TYPE_TOKENS.filter((t) => workType.includes(t));
  const selected = record.candidateDiscovery.selected;
  let summary: string;
  if (!selected) {
    summary = "Not selected by the keyword/work-type discovery rule.";
  } else if (keywordHits.length && workTypeHits.length) {
    summary = `Selected because the description matched ${keywordHits.slice(0, 4).join(", ")} and work type matched ${workTypeHits.join(", ")}.`;
  } else if (keywordHits.length) {
    summary = `Selected because the description matched ${keywordHits.slice(0, 6).join(", ")}.`;
  } else if (workTypeHits.length) {
    summary = `Selected because work type matched ${workTypeHits.join(", ")}.`;
  } else {
    summary = "Marked as a candidate in the snapshot; no current keyword/work-type token matched this sanitized text.";
  }
  return { selected, keywordHits, workTypeHits, summary, caveat: DISCOVERY_CAVEAT };
}
