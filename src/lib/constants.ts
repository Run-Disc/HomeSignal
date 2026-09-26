export const SNAPSHOT_VERSION = "pli-2025-bda-v1";
export const PROMPT_VERSION = "homesignal-extract-v1";
export const SCHEMA_VERSION = "extraction-proposal-v1";
export const PAGE_SIZE = 25;
export const FLAGSHIP_RECORD_ID = "pli:BDA-2024-05307";
export const FLAGSHIP_PERMIT_ID = "BDA-2024-05307";
export const AMBIGUOUS_RECORD_ID = "pli:BDA-2025-01572";
export const AMBIGUOUS_PERMIT_ID = "BDA-2025-01572";
export const REVIEW_STORAGE_KEY = `homesignal.reviews.${SNAPSHOT_VERSION}`;
export const EXTRACTION_CACHE_KEY = `homesignal.extractionCache.${SNAPSHOT_VERSION}`;
export const FAILED_EXTRACTION_KEY = `homesignal.failedExtractions.${SNAPSHOT_VERSION}`;

export const SOURCE_LANDING = "https://data.wprdc.org/dataset/pli-permits";
export const SOURCE_RESOURCE =
  "https://data.wprdc.org/dataset/pli-permits/resource/f4d1177a-f597-4c32-8cbf-7885f56253f6";
export const SOURCE_DUMP =
  "https://data.wprdc.org/datastore/dump/f4d1177a-f597-4c32-8cbf-7885f56253f6";
export const SOURCE_RESOURCE_ID = "f4d1177a-f597-4c32-8cbf-7885f56253f6";
export const CITY_PERMIT_GUIDANCE =
  "https://www.pittsburghpa.gov/Business-Development/Permits-Licenses-and-Inspections/Permitting";
export const ONESTOP =
  "https://www.pittsburghpa.gov/Business-Development/Permits-Licenses-and-Inspections/OneStopPGH-Permit-Center";

export const SCOPE_LABELS: Record<string, string> = {
  new_building: "New building (project label)",
  conversion: "Conversion / change of use (project label)",
  addition_or_alteration: "Addition or alteration (project label)",
  demolition: "Demolition (project label)",
  other: "Other work (project label)",
  uncertain: "Uncertain",
  housing: "Housing-related evidence",
  not_housing: "Not housing-related on this text",
};

export const COUNT_LABELS: Record<string, string> = {
  existingUnitCount: "Existing units mentioned",
  proposedTotalUnitCount: "Proposed total units mentioned",
  explicitAddedUnitCount: "Explicit added units mentioned",
  explicitRemovedUnitCount: "Explicit removed units mentioned",
};

export const DECISION_SUPPORT =
  "Decision support only. Verify project details and completion with the responsible public authority. Prototype review is not a City determination.";
