# HomeSignal BUILD_STATUS

Updated: 2026-09-26 (final sprint judge-path pass)

## Stage

Judge-path and source-review UX on public `main` (parent `f58235f`). Runtime remains **source-review**: no `.env.local`, no process extraction key, `saved-extractions.json` is `[]`. No demo video, hosted URL, identity, or form submission is claimed.

Deadline: Sunday 2026-09-27 23:59 ET.

## Source (unchanged)

- Resource: `f4d1177a-f597-4c32-8cbf-7885f56253f6`
- Dump rows: **65,378**; catalog HTML preview still listed **49,255**; product uses the dump
- 2025 Building / BDA unique IDs: **4,243**; candidates **727**; blank descriptions **2,417**
- Snapshot version: `pli-2025-bda-v1`
- Snapshot sha256: `283a311a5dde72bacf863a8dfe638ca62f624e45af17d97d0c3b4218a9dabf3d`

## Product changes in this pass

- Overview leads with the analyst decision, one-click flagship example `BDA-2024-05307`, an ambiguous-case link, and paginated records (25 per page). Metric denominators still use the full selected cohort.
- Review workspace leads with **Record human source review**. Accept/Reject are hidden until a proposal exists. Counts become sourced only with an exact matching quote.
- Keyword/work-type **discovery aid** is labeled as fallible, not as model output.
- Export names filter scope, featured example, and reviewed-only evidence; print CSS hides controls.

## Checks

- `npx tsc --noEmit`: pass.
- `npm run build`: pass (Next.js 15.5.26).
- Unit tests: `tsx --test` fails in this sandbox with `listen EPERM` on a tsx IPC pipe. Fallback `tsc` emit to `.tmp/test-js` + `node --test`: **30/30 pass**.
- Browser on production `http://127.0.0.1:3020`: Overview showed the analyst decision, flagship button, and “1–25 of 727” pagination. Review of `BDA-2024-05307` showed the 12-dwelling-unit quote, **Save source review** / **Insufficient evidence**, no Accept/Reject, and the discovery-aid caveat. Export named filter scope and featured example `BDA-2024-05307`. A stale `next dev` on :3000 mixed with `.next` and 500’d `/review` (`vendor-chunks/zod.js`); restart against a clean `.next` before recording.
- `POST /api/extract` remains unconfigured (no runtime key). No genuine saved model responses.

## Builder-only remaining actions

1. Record and publish the 3–5 minute video using `DEMO_SCRIPT.md`; paste the URL on the live form.
2. Fill Team Name, Member #1 name/email/affiliation; complete over-18 attestation; submit the form yourself.
3. Optional independent labels on `data/evaluation/blind-label-worksheet.md`.
4. Optional separate runtime extraction key in `.env.local` only — never commit it.
5. If the local review route 500s, restart the app after `npm run build` so `.next` is not shared with a stale dev server.
