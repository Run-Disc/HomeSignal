# HomeSignal BUILD_STATUS

Updated: 2026-09-26 ~09:50 America/New_York

## Stage

Core Track 2 workflow is implemented. Public snapshot regenerated after removing parcel identifiers and adding a description privacy scan. Next: tests/typecheck, `npm run dev`, browser inspection, local git commit. No public publish or event-form submission.

## Source (verified 2026-09-26)

- PLI resource `f4d1177a-f597-4c32-8cbf-7885f56253f6`
- Dump rows obtained: **65,378** (catalog preview still listed 49,255)
- 2025 Building + Building & Development Application unique IDs in public snapshot: **4,243**
- Candidates: **727**; review-corpus allowlist: **120**; comparison sample: **20**
- Commercial-class records with housing keywords (pre-privacy, same cohort size): **107**
- Unit-hint descriptions: **37**
- Blank descriptions: **2,417**
- Snapshot version: `pli-2025-bda-v1`
- Snapshot sha256: `283a311a5dde72bacf863a8dfe638ca62f624e45af17d97d0c3b4218a9dabf3d`

## Privacy scan results (this ingest)

Structured fields **not** written to the public snapshot, client types, model prompt, or CSV/print export: `owner_name`, `contractor_name`, `address`, `parcel_num` / `parcelId`, `latitude`, `longitude`, `total_project_value`, `council_district`, `ward`, `zip_code`.

Description scan on the 4,243 cohort records:

| Result | Count |
|---|---|
| Records excluded for residual personal data after sanitization | **0** |
| Descriptions with house-number street pattern replaced by `[REDACTED_ADDRESS]` | **21** |
| Email redactions | **0** |
| Phone redactions | **0** |
| Contact-phrase redactions | **0** |
| Owner/contractor string matches in description | **0** |

The audit does not store the removed address strings. Automated redaction is incomplete. Builder inspection of `data/review-corpus-preview.json` is still required before any external model call.

## Runtime AI

No `EXTRACTION_API_KEY` in this environment. Mode is **source-review-only**. `saved-extractions.json` is `[]`. No genuine saved model responses exist.

## How to run

```bash
export PATH="$PWD/.tools/node/bin:$PATH"   # or Node 22+
npm install
npm test
npx tsc --noEmit
npm run dev
```

Open http://localhost:3000
