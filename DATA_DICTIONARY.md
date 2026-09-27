# Data dictionary

Project labels below are implementation choices. They are not official City of Pittsburgh categories.

## PermitRecord (sanitized snapshot)

| Field | Meaning |
|---|---|
| recordId | Stable internal id, `pli:{permit_id}` |
| sourcePermitId | Source `permit_id` as a string |
| sourceResourceId | WPRDC resource UUID |
| issueDate | Date-only `YYYY-MM-DD` from source `issue_date` (no timezone shift) |
| permitTypeRaw | Source `permit_type` |
| permitTypeNormalized | `building` or `building_development_application` |
| sourceClassRaw | Source `commercial_or_residential` (Residential / Commercial observed) |
| workTypeRaw | Source `work_type` |
| sourceStatusRaw | Source `status` (current label only) |
| neighborhood | Trimmed source neighborhood; `Unknown` if blank |
| workDescriptionSanitized | Source description after contact/address redaction; blank if the source was blank |
| citationId | `src:pli:{permit_id}` assigned by the app |
| snapshotVersion | `pli-2025-bda-v1` |
| qualityFlags | e.g. `blank_description`, `redacted_street_address` |
| candidateDiscovery.selected | Whether the project keyword/work-type rule selected the record |
| inReviewCorpus | AI allowlist (up to 120 records) |
| inComparisonSample | Non-keyword comparison sample (20 records) |

Parcel numbers, owner names, contractor names, and street addresses are not public snapshot fields.

## ExtractionProposal

| Field | Meaning |
|---|---|
| housingRelevance | `housing`, `not_housing`, `uncertain` |
| proposedScope | `new_building`, `conversion`, `addition_or_alteration`, `demolition`, `other`, `uncertain` |
| existingUnitCount / proposedTotalUnitCount / explicitAddedUnitCount / explicitRemovedUnitCount | Nonnegative integers or null. Null means unknown, not zero. |
| countEvidence | Exact quote from the work description for each non-null count |
| originLabel | `live`, `previously_generated`, or `unavailable` |

Proposed total is not net addition.

Synthetic strings in `data/evaluation/adversarial-synthetic.json` are test fixtures, not snapshot records.

## ReviewDecision

| State | Meaning |
|---|---|
| unreviewed | No local decision |
| accepted | Reviewer accepted supported proposal fields |
| corrected | Reviewer edited fields; unsourced numbers become notes |
| rejected | Proposal retained for inspection, excluded from reviewed findings |
| insufficient_evidence | Fields left unknown with a verification question |

`accepted` means accepted by the prototype reviewer, not approved by Pittsburgh.

## Housing context and reconciliation

The Queue's expandable **Housing context: rents & community** panel includes real public aggregate data, frozen September 27, 2026:

- **Zillow Research ZORI:** Pittsburgh, PA metro (RegionID 394982), all homes plus multifamily, smoothed monthly 2025. [Source and methodology](https://www.zillow.com/research/data/); [downloaded CSV](https://files.zillowstatic.com/research/public_csvs/zori/Metro_zori_uc_sfrcondomfr_sm_month.csv). Values retain source precision in `data/public/housing-context.json`; the UI rounds dollars. The raw CSV SHA-256 is in that manifest. Historical values may be revised; this is the retrieval-date vintage, not a contemporaneous 2025 release. Attribution: Zillow Research. Zillow data are not covered by the PLI dataset's CC-BY license.
- **U.S. Census Bureau QuickFacts:** [Pittsburgh city, Pennsylvania](https://www.census.gov/quickfacts/pittsburghcitypennsylvania), FIPS 4261000, 2020–2024. Median gross rent $1,261; living in the same house one year ago, 79.4% of people age 1+. Values transcribed from the official table. The API returned a missing-key page, so no API result is claimed. QuickFacts does not display margins of error in this extract. No significance testing or neighborhood allocation is supported.

**Reconciliation:** PLI measures city permit records by 2025 issue month; ZORI measures metro market rents by month; Census measures city survey characteristics over five years. They are displayed together but never joined at household or neighborhood level. The app does not subtract the two rent measures, infer causation, or treat residential stability as displacement or net household flows. Neighborhood queue filters intentionally do not alter this fixed city/metro context. Context does not enter permit CSV or briefing calculations.
