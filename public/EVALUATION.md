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
- Manual counts become sourced only with an exact matching quote (`src/lib/reviewLogic.test.ts`)
- Briefing CSV omits unreviewed candidates (`src/lib/briefing.test.ts`)
- Keyword/work-type discovery aid is labeled as fallible, not as a model (`src/lib/discovery.test.ts`)
- Proposal validation rejects extra keys, missing evidence, unmatched quotes, record mismatch, and class-as-count evidence (`src/lib/extraction.test.ts`)

## Release targets not yet demonstrated with a live model

- No unsupported count accepted by validation/review in a live demo corpus
- Reliable abstention on ambiguous real examples under a named model/prompt version
- Latency and provider-failure rates for a real endpoint

If live extraction is enabled later, report numerator/denominator, sample composition, and model/prompt version. Do not invent an overall accuracy percentage.
