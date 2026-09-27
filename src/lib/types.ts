export type HousingRelevance = "housing" | "not_housing" | "uncertain";

export type ProposedScope =
  | "new_building"
  | "conversion"
  | "addition_or_alteration"
  | "demolition"
  | "other"
  | "uncertain";

export type ReviewState =
  | "unreviewed"
  | "accepted"
  | "corrected"
  | "source_reviewed"
  | "rejected"
  | "insufficient_evidence";

export type ReviewOrigin = "ai_assisted_review" | "manual_source_review";

export type CountField =
  | "existingUnitCount"
  | "proposedTotalUnitCount"
  | "explicitAddedUnitCount"
  | "explicitRemovedUnitCount";

export type EvidenceSpan = {
  field: "workDescriptionSanitized" | "workTypeRaw" | "permitTypeRaw" | "sourceClassRaw";
  quote: string;
  start: number;
  end: number;
  interpretation: string;
};

export type PermitRecord = {
  recordId: string;
  sourcePermitId: string;
  sourceResourceId: string;
  issueDate: string;
  permitTypeRaw: string | null;
  permitTypeNormalized: string;
  sourceClassRaw: string | null;
  workTypeRaw: string | null;
  sourceStatusRaw: string | null;
  neighborhood: string;
  workDescriptionSanitized: string;
  citationId: string;
  snapshotVersion: string;
  qualityFlags: string[];
  candidateDiscovery: {
    selected: boolean;
    method: string;
  };
  inReviewCorpus: boolean;
  inComparisonSample: boolean;
};

export type ExtractionProposal = {
  targetRecordId: string;
  sanitizedInputHash: string;
  snapshotVersion: string;
  housingRelevance: HousingRelevance;
  proposedScope: ProposedScope;
  existingUnitCount: number | null;
  proposedTotalUnitCount: number | null;
  explicitAddedUnitCount: number | null;
  explicitRemovedUnitCount: number | null;
  countEvidence: Partial<Record<CountField, EvidenceSpan>>;
  classificationEvidence: {
    housingRelevance: EvidenceSpan | null;
    proposedScope: EvidenceSpan | null;
  };
  explanation: string;
  missingEvidence: string[];
  followUpRole: string;
  followUpQuestion: string;
  modelId: string;
  promptVersion: string;
  schemaVersion: string;
  generatedAt: string;
  originLabel: "live" | "previously_generated" | "unavailable";
};

export type ReviewedFields = {
  housingRelevance: HousingRelevance;
  proposedScope: ProposedScope;
  existingUnitCount: number | null;
  proposedTotalUnitCount: number | null;
  explicitAddedUnitCount: number | null;
  explicitRemovedUnitCount: number | null;
  countEvidence: Partial<Record<CountField, EvidenceSpan>>;
  unsourcedNotes: string[];
};

export type ReviewDecision = {
  recordId: string;
  snapshotVersion: string;
  sanitizedInputHash: string;
  origin: ReviewOrigin;
  proposalVersion: string | null;
  state: ReviewState;
  reviewerRole: "prototype_builder" | "local_reviewer";
  timestamp: string;
  finalFields: ReviewedFields | null;
  reason: string;
};

export type Filters = {
  search?: string;
  year: string;
  neighborhood: string;
  reviewState: "all" | ReviewState | "needs_review";
  candidatesOnly: boolean;
};

export type MetricSet = {
  permitRecordsInCohort: number;
  potentialHousingRecords: number;
  reviewedRecords: number;
  reviewedHousingRecords: number;
  needsReview: number;
  insufficientEvidence: number;
  rejected: number;
  failedExtractions: number;
  recordsWithExplicitProposedUnitMention: number;
  monthlyIssued: { month: string; count: number }[];
  extractionCoverageNumerator: number;
  extractionCoverageDenominator: number;
  blankDescriptions: number;
};

export type ClientPermit = PermitRecord & {
  inputHash: string;
  descriptionPreview: string;
};

export type AiMode = "live" | "saved" | "source-review";
