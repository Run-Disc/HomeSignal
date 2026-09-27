# Evaluation

No independent accuracy percentage is reported. No expert validation has occurred. Labels copied from a model are not ground truth.

## Real-data labeling sheet (unlabeled)

File: `data/evaluation/labeling-sheet.json`

These are sanitized records from the 2025 Building/BDA snapshot. The builder should classify them **before** seeing model predictions, especially held-out IDs. Cursor assembled the sheet from the snapshot; it did not fill independent labels.

Composition targeted (counts are sheet membership, not model scores):

- Commercial-class records with housing language
- Residential alterations
- Explicit unit-ish language
- Ambiguous or “no work” language
- Comparison records without discovery keywords
- Blank descriptions

A 12-row human worksheet is in `data/evaluation/blind-label-worksheet.md` (held-out IDs omitted from the answer columns). Cursor did not fill those labels.

Until the builder completes independent labels, housing-relevance agreement, scope agreement, and count-type accuracy are **not measured**.

## Held-out IDs (do not use while iterating on the prompt)

See `heldOut` in the labeling sheet. Keep them unseen during prompt development if live extraction is later configured.

## Synthetic adversarial tests

File: `data/evaluation/adversarial-synthetic.json`

**Label: `synthetic_adversarial`.** These strings are **not** City of Pittsburgh permit records. They must not appear in the Queue, Record, or Briefing as real permits. They are excluded from factual metrics. They exist only to test validator/reviewer behavior in unit tests (two stories, three bedrooms, repair of existing apartments, explicit 1→3 conversion, embedded instructions, bogus citation IDs).

Automated validator tests live in `src/lib/extraction.test.ts` and currently check schema/evidence rejection on a fixture string. That fixture is a test double, not a live model response. Do not present it as API output.

## What has been measured in code

- Metric denominators and review-state updates (`src/lib/metrics.test.ts`)
- CSV formula-prefix neutralization (`src/lib/csv.test.ts`)
- Manual counts require an exact matching quote; clearing a saved count clears its evidence; unsafe numeric values are rejected (`src/lib/reviewLogic.test.ts`). Text matching verifies provenance, not whether a number denotes homes, stories, or another quantity: that interpretation remains a human responsibility.
- Briefing CSV omits unreviewed candidates and stale-source reviews, and preserves source URLs, hashes, and all count evidence (`src/lib/briefing.test.ts`)
- Keyword/work-type discovery aid is labeled as fallible, not as a model (`src/lib/discovery.test.ts`)
- Proposal validation rejects extra keys, missing evidence, unmatched quotes, record mismatch, and class-as-count evidence (`src/lib/extraction.test.ts`)
- Labeled demo extraction quotes dwelling-unit phrases and refuses story counts (`src/lib/demoExtraction.test.ts`)
- Simulated runtime AI is schema-valid, deterministic, grounded in the supplied row, silent on blank descriptions, and does not invent extra permit IDs (`src/lib/demoProvider.test.ts`)
- Decision support for the flagship record establishes the “12 DWELLING UNITS” reference without claiming completion, occupancy, owner, contractor, zoning, or inspection facts. Next steps are phrased conditionally. Blank descriptions report *Not found* coverage. Non-standard wording such as “32 UNIT DWELLINGS” is not treated as an explicit dwelling count. Copied summaries label the AI section as simulated (`src/lib/demoProvider.test.ts`).
- Extraction status stays **Extracted — review required** until a person saves a decision (`src/lib/extractUi.test.ts`)

## Release targets not yet demonstrated with a live model

- No unsupported count accepted by validation/review in a live demo corpus
- Reliable abstention on ambiguous real examples under a named model/prompt version
- Latency and provider-failure rates for a real endpoint

If live extraction is enabled later, report numerator/denominator, sample composition, and model/prompt version. Do not invent an overall accuracy percentage.

## Next-phase measurements (planned, not run)

A practitioner pilot would record these for the same 30–50 records reviewed with the raw source and with HomeSignal:

| Measure | How | Why |
|---|---|---|
| Review time | Minutes per record, per reviewer, per condition | Tests the claim that cited evidence speeds a handoff |
| Extraction accuracy | Precision and recall by count type against independent labels | Separates correct dwelling counts from stories, parking, and accessibility units |
| Correction count | Number of extracted fields a reviewer changed or rejected | Shows where the extractor misleads reviewers |
| Citation usefulness | Reviewer marks each cited quote as useful, irrelevant, or misleading | Tests whether Show in source actually helps |
| Unsupported claims | Count of brief statements not supported by a quote or field | Target is zero; any non-zero result blocks production use |

No partner has agreed to run this pilot, and none of these numbers exists yet.
