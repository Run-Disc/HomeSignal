# HomeSignal BUILD_STATUS

Updated: 2026-09-26 11:12 America/New_York

## Stage

Documentation-only compliance correction on public `main` (parent `b0c3c81`). Application behavior and snapshot data were not changed. No event form submitted. No deployment. No identity or attestation invented.

## This pass

- Rewrote `DEMO_SCRIPT.md` as a timed ~4:00 (3–5 minute) recording script; removed the “about two minutes” video framing.
- Added README **Libraries, frameworks, APIs, and tools** (no implied endorsements).
- Added `COMPLIANCE_AUDIT.md` requirements matrix (Verified / Prepared / Builder action required).
- Aligned `SUBMISSION_CHECKLIST.md` to the live Google form fields as independently reviewed.
- Copied changed docs into `public/`, including `COMPLIANCE_AUDIT.md`.

## Source (unchanged)

- Resource: `f4d1177a-f597-4c32-8cbf-7885f56253f6`
- Dump rows: **65,378**; catalog HTML preview still listed **49,255**; product uses the dump
- 2025 Building / BDA unique IDs: **4,243**; candidates **727**; blank descriptions **2,417**
- Snapshot version: `pli-2025-bda-v1`
- Snapshot sha256: `283a311a5dde72bacf863a8dfe638ca62f624e45af17d97d0c3b4218a9dabf3d`

## Privacy scan (unchanged from ingest)

| Check | Count |
|---|---|
| Records excluded for residual personal data after sanitization | **0** |
| House-number street patterns replaced with `[REDACTED_ADDRESS]` | **21** |
| Email / phone / owner-contractor-contact redactions | **0 / 0 / 0** |

## Checks (this pass)

- Root docs `cmp` equal to `public/` copies: README, DEMO_SCRIPT, SUBMISSION_CHECKLIST, COMPLIANCE_AUDIT, BUILD_STATUS.
- A later **`npm ci` was interrupted/aborted** (hung with almost no output after deleting packages). Dependencies were **not** modified or reinstalled afterward. `node_modules` may be incomplete locally.
- **`npm test` and `tsc` were not re-run in this documentation pass.** App verification remains commit **`b0c3c81`**.
- Production `next build` was not re-run.
- Runtime mode remains **source-review-only**. No demo video, hosted URL, team identity, or form submission is claimed.

## Link check (this pass)

Opened or HTTP-checked from this environment where possible:

- https://github.com/Run-Disc/HomeSignal
- https://data.wprdc.org/dataset/pli-permits
- https://data.wprdc.org/dataset/pli-permits/resource/f4d1177a-f597-4c32-8cbf-7885f56253f6
- https://data.wprdc.org/datastore/dump/f4d1177a-f597-4c32-8cbf-7885f56253f6
- https://docs.google.com/forms/d/e/1FAIpQLSfDK_aD-miOV3D92Bl4NOFa1Skb8_u-GTCH5j1FE-VEWTr4DQ/viewform
- City PLI / OneStopPGH URLs in `SOURCES.md`: this checker received **HTTP 403** (likely bot filtering). Citations are unchanged; they were not re-fetched as HTML. Dump URL HEAD: **200**. `opendefinition.org/licenses/cc-by`: **301**.

Internal doc references: `README.md`, `DEMO_SCRIPT.md`, `SOURCES.md`, `AI_DISCLOSURE.md`, `LIMITATIONS.md`, `EVALUATION.md`, `SUBMISSION_CHECKLIST.md`, `COMPLIANCE_AUDIT.md`.

## Builder-only remaining actions

1. Record and publish the 3–5 minute video; paste the URL on the live form.
2. Fill Team Name, Member #1 name/email/affiliation; complete over-18 attestation; submit the form yourself.
3. Optional live AI key or Vercel import — never commit secrets.
