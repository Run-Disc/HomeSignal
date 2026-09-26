# HomeSignal BUILD_STATUS

Updated: 2026-09-26 10:15 America/New_York

## Stage

Must-ship workflow is implemented and running locally. Public snapshot has no parcel identifiers. Privacy scan results below are from the 2026-09-26 ingest of the downloaded PLI dump. No event form was submitted.

## Source (verified)

- Resource: `f4d1177a-f597-4c32-8cbf-7885f56253f6`
- Dump rows: **65,378** (catalog HTML preview still listed 49,255; product uses the dump)
- 2025 Building / Building & Development Application unique IDs in public snapshot: **4,243**
- Potential housing candidates: **727**
- Review-corpus allowlist: **120**
- Comparison sample: **20**
- Blank descriptions: **2,417**
- Snapshot version: `pli-2025-bda-v1`
- Snapshot sha256: `283a311a5dde72bacf863a8dfe638ca62f624e45af17d97d0c3b4218a9dabf3d`

## Privacy scan (automated ingest)

Public snapshot, `PermitRecord` / client types, model prompt payload, and CSV/print export **do not include** `parcelId`, `parcel_num`, `owner_name`, `contractor_name`, `address`, `latitude`, `longitude`, `total_project_value`, or contact details.

Description scan on the 4,243 retained cohort records (tokens replace matches; no invented source prose):

| Check | Count |
|---|---|
| Records excluded for residual personal data after sanitization | **0** |
| House-number street patterns replaced with `[REDACTED_ADDRESS]` | **21** |
| Email redactions | **0** |
| Phone redactions | **0** |
| Owner/contractor/contact-phrase redactions | **0** |

Audit counts do not store the removed strings. Automated redaction is incomplete. Inspect `data/review-corpus-preview.json` before any external model call.

## Checks

- `npm test`: **19 passed, 0 failed** (metrics, extraction validation, CSV safety, snapshot privacy including no `parcelId` in the public JSON files).
- `npx tsc --noEmit`: exit 0.
- Production `next build` is not required for the local demo; it was not re-run in this pass.
- Runtime mode: **source-review-only** (`saved-extractions.json` is `[]`; no `EXTRACTION_API_KEY`).

## Browser (this event window)

- Overview: 4,243 / 727 record metrics, 2025 monthly issued-record chart, search for `BDA-2024-05307`.
- Review: Commercial source class; description includes “TOTAL OF 12 DWELLING UNITS ABOVE”; no parcel field shown.
- Sources: CC-BY, dump URL, parcel numbers listed among excluded fields.
- Export: HTTP 200. Print/CSV omit parcel identifiers.
- `POST /api/extract`: HTTP 200, `mode: source-review` (no runtime key).

## Run

```bash
export PATH="$PWD/.tools/node/bin:$PATH"
npm install
npm test
npm run dev
```

Open http://localhost:3000

## Builder-only remaining actions

1. Review the labeling sheet and corpus yourself.
2. Optional live AI: `.env.local` with `EXTRACTION_API_KEY` and `EXTRACTION_MODEL` (never commit).
3. Public repo, 3–5 minute demo, and event-form submission are yours. Do not ask Cursor to attest eligibility.
