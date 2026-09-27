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
