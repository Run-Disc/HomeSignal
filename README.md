# HomeSignal

HomeSignal is a Pittsburgh permit-evidence observatory for the AI for Housing Hackathon (AI Horizons 2026), Track 2: Housing Production, Rents & Household Flow Observatory.

**Public repository:** https://github.com/Run-Disc/HomeSignal

**One sentence:** it helps a housing analyst turn messy PLI permit descriptions into reviewable evidence about proposed housing activity, while keeping record counts, proposed-unit mentions, and completed homes distinct.

A permit record is not a housing unit. An issued permit is not a completed home.

## Working prototype walkthrough

The required public demo is a **3–5 minute video**. Narration is in `DEMO_SCRIPT.md` (target about 4:00). No video is in this repository.

In the running app:

1. Open Overview. The question is: inspect a permit description, decide what is supported, export a follow-up note. The four cards count **issued permit records**, not homes built.
2. Click **Explore a real example** (`BDA-2024-05307`). It is Commercial class with “TOTAL OF 12 DWELLING UNITS ABOVE.”
3. Treat that sentence as proposed-unit language on an issued permit, not occupancy. A labeled keyword/work-type discovery aid explains why the record is in the queue; it is not model output.
4. This deployment is **source-review**: there is no runtime key and no saved genuine model response. Use **Save source review** or **Insufficient evidence**. Accept/Reject appear only if a proposal exists.
5. Open Export briefing. Print/CSV covers **reviewed** evidence only, with the current filter scope named on the page. There is no citywide homes-built total. The record list is paginated (25 per page); search still covers the full matching set.

## Libraries, frameworks, APIs, and tools

Names below describe what this repository uses. They are **not endorsements** by those projects, vendors, the City of Pittsburgh, WPRDC, OpenAI, Cursor, xAI, or the event organizers.

| Name | Role in HomeSignal |
|---|---|
| Next.js 15 (App Router) | Web application framework, routing, production build |
| React 19 | UI components (overview, review workspace, export) |
| TypeScript | Typed application and library code |
| Zod | Schema validation for extraction proposals |
| Node.js 22 and npm | Runtime, package install, `node:test` + `tsx` test runner |
| WPRDC / CKAN | Public catalog and CSV dump of City of Pittsburgh PLI Permits (data API/download, not a paid product API) |
| Optional OpenAI-compatible Chat Completions HTTP endpoint | Server-side extraction only when `EXTRACTION_API_KEY` and `EXTRACTION_MODEL` are set. **Not configured in this repository.** Not used in the working demo path. |
| Cursor (Grok 4.6) | Implementation assistance during the authorized build window beginning 2026-09-26 09:00 America/New_York. Not a runtime model for visitors. Coding credits are not an extraction API key. |

Python 3 is used only for the optional ingest script `scripts/ingest_pli.py`. The committed snapshot is enough to run the app. Vercel is a documented optional host (`vercel.json`); **no deployment is claimed**.

## Architecture

- Next.js 15 App Router + React 19 + TypeScript.
- Sanitized 2025 PLI snapshot in `data/public/permits-2025.json` (copied to `public/data/` for static serving).
- Deterministic metrics and filters in `src/lib/metrics.ts`.
- Optional server-side extraction at `POST /api/extract` (`src/lib/extractClient.ts`). Quote/schema validation in `src/lib/extraction.ts`.
- Human reviews persist in **this browser’s** `localStorage` for the current snapshot version only.
- Export: print briefing + formula-neutralized CSV (`src/lib/briefing.ts`, `src/lib/csv.ts`).
- Ingest: `scripts/ingest_pli.py` (not required to run the app).

## Data provenance

| Item | Value |
|---|---|
| Source | City of Pittsburgh PLI Permits via WPRDC |
| Resource | `f4d1177a-f597-4c32-8cbf-7885f56253f6` |
| Retrieval | 2026-09-26 CKAN dump (65,378 rows; catalog HTML preview still listed 49,255) |
| License | Creative Commons Attribution |
| Product cohort | 2025 issue dates, `BUILDING` or `Building & Development Application` |
| Unique IDs in snapshot | 4,243 |
| Potential housing candidates | 727 (keyword / work-type discovery, including commercial class) |
| Snapshot version | `pli-2025-bda-v1` |

See `SOURCES.md` and `DATA_DICTIONARY.md`.

## Privacy treatment

Owner names, contractor names, street addresses, parcel identifiers, coordinates, project value, and contact fields are **not** in the public snapshot, UI types, extraction prompt payload, or CSV/print export.

On ingest, descriptions are scanned for emails, phones, owner/contractor/contact phrases, and house-number street patterns. Matching street patterns are replaced with `[REDACTED_ADDRESS]` (21 records on 2026-09-26). Residual personal data would exclude a record rather than invent replacement prose (0 exclusions). Automated redaction is incomplete.

## AI behavior

- Cursor coding credits are **not** a runtime API key.
- Without `EXTRACTION_API_KEY` + `EXTRACTION_MODEL`, mode is **source-review**. The review action does not pretend a live request is in flight.
- `data/public/saved-extractions.json` is empty in this repository. No genuine saved model responses are claimed.
- When a key is later configured, extraction is limited to the 120-record allowlist, must quote source text, and is rejected if it invents counts or citation IDs.

## Human-in-the-loop safeguards

- Manual review works with no model output.
- Accept is disabled in practice when there is no proposal; Correct / Insufficient evidence / Reject still work.
- Reviews are labeled as local reviewer, not City determinations.
- Metrics never sum unit mentions into a citywide homes-built total.
- Decision support only: verify with the responsible public authority (OneStopPGH / PLI).

## Limitations (short)

No construction-start, completion, or occupancy inference. No proposed→issued→completed funnel. Blank descriptions: 2,417 of 4,243 cohort records. No accuracy percentage: the labeling sheet is unlabeled. Details: `LIMITATIONS.md`, `EVALUATION.md`, `AI_DISCLOSURE.md`.

## Run locally

Requires Node.js 22+ (this repo can use `.tools/node` if Node is not on PATH). The sanitized snapshot is already committed.

```bash
export PATH="$PWD/.tools/node/bin:$PATH"   # only if Node is not on PATH
npm install
npm test
npx tsc --noEmit
npm run dev
```

Open http://localhost:3000

Optional live extraction (server-side only): copy `.env.example` to `.env.local`. Never commit keys.

```bash
npm run build
npm start
```

## Vercel (configuration only)

This repository includes `vercel.json` (`framework: nextjs`, `npm ci`, `npm run build`). **No Vercel deployment was performed or verified in this event-window pass.** If you import the GitHub repo in Vercel yourself:

1. Framework: Next.js, Node 22.
2. Do **not** add `EXTRACTION_API_KEY` unless you intend a paid live-extraction demo.
3. After import, confirm Overview, one record review, Sources, and Export yourself. Do not treat this README as proof that a host is live.

## License and attribution

Application code is provided for the hackathon submission. Permit data remains a City of Pittsburgh dataset published by WPRDC under Creative Commons Attribution. Do not treat prototype review as an official City determination.
