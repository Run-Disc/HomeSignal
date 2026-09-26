# HomeSignal BUILD_STATUS

Updated: 2026-09-26 10:30 America/New_York

## Stage

Judge-facing quality pass on public `main` (from `3d86fdc`). Keyless review action no longer looks like a live extraction request. No event form submitted. No Vercel deployment was performed.

## Source (verified)

- Resource: `f4d1177a-f597-4c32-8cbf-7885f56253f6`
- Dump rows: **65,378** (catalog HTML preview still listed 49,255; product uses the dump)
- 2025 Building / Building & Development Application unique IDs: **4,243**
- Potential housing candidates: **727**
- Review-corpus allowlist: **120**
- Comparison sample: **20**
- Blank descriptions: **2,417**
- Snapshot version: `pli-2025-bda-v1`
- Snapshot sha256: `283a311a5dde72bacf863a8dfe638ca62f624e45af17d97d0c3b4218a9dabf3d`

## Privacy scan (automated ingest)

Public snapshot, types, prompts, and CSV/print export do not include `parcelId`, `parcel_num`, owner, contractor, address, coordinates, or contact details.

| Check | Count |
|---|---|
| Records excluded for residual personal data after sanitization | **0** |
| House-number street patterns replaced with `[REDACTED_ADDRESS]` | **21** |
| Email / phone / owner-contractor-contact redactions | **0 / 0 / 0** |

## Checks (this pass)

- `npm test`: **21 passed, 0 failed** (includes extraction UI keyless-mode tests).
- `npx tsc --noEmit`: exit 0.
- `npm run build`: succeeded (Next.js 15.5.26, lint + types during build).
- Production `npm run start:3001`: Overview, review, sources, export, evaluation HTTP 200.
- `POST /api/extract`: HTTP 200, `mode: source-review` (no runtime key).
- No Vercel host is claimed.

## Browser (production on :3001)

- Desktop overview: two-minute judge path, 4,243 / 727 metrics, search `BDA-2024-05307` → 1 row.
- Review: Commercial class; “TOTAL OF 12 DWELLING UNITS ABOVE”; button **Why AI extraction is unavailable**; status says this is not a live request; click did not change the label to a requesting state.
- Mobile width (~390px): stacked primary nav, full-width controls, judge path readable.
- Export and Sources return HTTP 200.

## Builder-only remaining actions

1. Review the labeling sheet yourself.
2. Optional live AI via `.env.local` or host env (never commit keys).
3. Record the demo; submit the event form yourself.
4. Import the GitHub repo into Vercel yourself if you want a hosted URL.
