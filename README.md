# HomeSignal

HomeSignal is a permit-review workspace for Pittsburgh PLI building records (AI for Housing Hackathon / AI Horizons 2026, Track 2).

It helps a housing analyst inspect an issued permit description, record what the text supports, and export a briefing. Queue totals are **permit records**, not homes built.

Pittsburgh already has project and dashboard tools. The City’s [Affordable Housing Development Project Explorer](https://www.arcgis.com/apps/dashboards/603c22bb04ba4a478ad91d0758b7c262) (announced 17 April 2025) maps affordable developments completed, under construction, in process, or in the pipeline. The City Controller’s June 2025 special report on inclusionary zoning recommended a broader Pittsburgh housing-development dashboard, or expanding that Explorer. HomeSignal is not that city dashboard and does not replace it. It is a **privacy-reduced, evidence-first permit-description review** workflow: exact quotes stay attached to counts, and issued records stay separate from proposed units.

**Public repository:** https://github.com/Run-Disc/HomeSignal

A permit record is not a housing unit. An issued permit is not a completed or occupied home. HomeSignal does not score zoning feasibility. Official zoning sources say district and use rules vary by location and project scope, and that most building permits require zoning approval (ROZA). Code, map, and zoning pages are listed on Sources as **future verification links**, not as ingested data.

## Download (no Node.js)

Packages are **unsigned**. Windows SmartScreen and macOS Gatekeeper will warn. Open only files from this GitHub project.

| Platform | File | Where to get it |
|---|---|---|
| Windows (x64) | `HomeSignal-Setup.exe` | [Latest GitHub Release](https://github.com/Run-Disc/HomeSignal/releases/latest) |
| macOS Apple Silicon | `HomeSignal-mac-arm64.dmg` and `.zip` | [Latest GitHub Release](https://github.com/Run-Disc/HomeSignal/releases/latest) |
| macOS Intel | `HomeSignal-mac-x64.dmg` and `.zip` | [Latest GitHub Release](https://github.com/Run-Disc/HomeSignal/releases/latest) |

Every package is rebuilt from the public tag by GitHub Actions. The same files also appear as architecture-specific workflow artifacts. Packages stay in Releases because current Electron installers exceed GitHub's single-file repository limit.

Windows: [WINDOWS_INSTALL.md](./WINDOWS_INSTALL.md). macOS: [MAC_INSTALL.md](./MAC_INSTALL.md).

The browser workflow (`npm run dev` / `npm start`) is unchanged.

## Product path

Nav: **Queue** → **Record** → **Briefing**.

1. Queue shows issued / housing queue / reviewed / open, a neighborhood-responsive monthly activity chart, and a spotlight row for `BDA-2024-05307`.
2. Record is the permit description on the left and a human review form on the right. Select exact source words to copy them into the evidence field, then save as **source reviewed** or mark insufficient evidence.
3. Briefing preserves the selected filters, highlights a featured source-backed count and its exact quote, identifies the next human verification step, and prints or downloads **reviewed** evidence only. Search and neighborhood selections travel through all three screens.

## Judging alignment

| Criterion | Demonstrated behavior |
|---|---|
| Problem value | Converts a large issued-permit list into a focused evidence-review queue. |
| User fit & usability | Plain-language Queue → Record → Briefing workflow; guided example; selection-to-quote evidence capture; keyboard focus, large controls, mobile record cards, and print output. |
| Technical execution | Deterministic local snapshot, validated review persistence, CSV formula protection, source-bound count checks, automated tests, and desktop packages. |
| Data & AI integrity | Cited WPRDC snapshot; privacy-reduced fields; exact supporting excerpts; explicit unknowns; no fabricated model output; human decision required. |
| Actionability | Moves from citywide or neighborhood activity to a permit-level source review, then produces a cited briefing without presenting an unsupported housing-production total. |
| Continuation potential | Add independently labeled evaluation data, test with a housing practitioner, connect current permit statuses, and pilot the review/export workflow with a civic partner. |

No score is guaranteed. The demo and documentation show the working evidence for each criterion so judges can evaluate it directly.

This repository’s working path is **source-review**: no runtime model key, `data/public/saved-extractions.json` is empty. Displayed findings are deterministic snapshot metrics or human-entered reviews. Cursor is not used at runtime.

## Libraries and tools

Names describe what this repository uses. They are **not endorsements**.

| Name | Role |
|---|---|
| Next.js 15, React 19, TypeScript, Zod | Web app |
| Node.js 22 / npm | Install, tests, production server |
| WPRDC / CKAN | PLI Permits dump (not a paid API) |
| Optional OpenAI-compatible Chat Completions | Server `POST /api/extract` **only if** `EXTRACTION_API_KEY` and `EXTRACTION_MODEL` are set. **Not configured here.** |
| Cursor (including Grok) and OpenAI Codex | Development assistance for code, debugging, tests, interface improvements, documentation, and demo preparation. Pre-event AI consultation supported public-source research and early sketches; no application code. **No runtime use.** See [AI disclosure](./AI_DISCLOSURE.md). |
| Electron + electron-builder | Unsigned Windows NSIS and macOS DMG/ZIP wrappers around the same Next standalone app |

Python 3 is used only for optional ingest (`scripts/ingest_pli.py`). The committed snapshot is enough to run. `vercel.json` exists; **no hosted deployment is claimed**.

## Data provenance

| Item | Value |
|---|---|
| Source | City of Pittsburgh PLI Permits via WPRDC |
| Resource | `f4d1177a-f597-4c32-8cbf-7885f56253f6` |
| Retrieval | 2026-09-26 CKAN dump (65,378 rows; catalog HTML preview listed 49,255) |
| License | Creative Commons Attribution |
| Product cohort | 2025 issue dates, `BUILDING` or `Building & Development Application` |
| Unique IDs | 4,243 |
| Housing queue (keyword / work-type discovery) | 727 |
| Snapshot | `pli-2025-bda-v1` |

See `SOURCES.md` and `DATA_DICTIONARY.md`. Zoning code, map, and City zoning pages stay unused context for later lookup.

## Privacy

Owner names, contractor names, street addresses, parcel identifiers, coordinates, project value, and contact fields are not in the public snapshot, UI types, extraction prompt payload, or CSV/print export.

On ingest, descriptions are scanned for emails, phones, owner/contractor/contact phrases, and house-number street patterns. Matching street patterns became `[REDACTED_ADDRESS]` (21 records on 2026-09-26). Residual personal data would exclude a record (0 exclusions). Automated redaction is incomplete.

## AI at runtime

- Cursor coding assistance is **not** a visitor API key and is **not** used while the app runs.
- Without `EXTRACTION_API_KEY` + `EXTRACTION_MODEL`, mode is source-review. The UI does not invent a live model answer.
- `saved-extractions.json` is `[]`. No genuine saved model responses are claimed.
- `data/evaluation/adversarial-synthetic.json` is labeled **synthetic_adversarial**. Those strings are not City records, are not shown in the queue, and are excluded from factual metrics.

## Human review

Manual review works with no model output. Reviews stay in this browser’s `localStorage` for the snapshot version. They are not City determinations. Metrics never sum unit mentions into a citywide homes-built total.

## Limitations (short)

No construction-start, completion, or occupancy inference. No proposed→issued→completed funnel. Blank descriptions: 2,417 of 4,243 cohort records. No accuracy percentage: the labeling sheet is unlabeled. No zoning feasibility. Details: `LIMITATIONS.md`, `EVALUATION.md`, `AI_DISCLOSURE.md`.

## Run locally

Requires Node.js 22+ (or `export PATH="$PWD/.tools/node/bin:$PATH"`).

```bash
npm install
npm test
npx tsc --noEmit
npm run dev
```

Open http://localhost:3000

```bash
npm run build
npm start
```

Optional live extraction: copy `.env.example` to `.env.local`. Never commit keys.

Desktop packages (unsigned):

```bash
npm run desktop:win      # Windows NSIS (CI on windows-latest)
npm run desktop:mac      # macOS DMG+ZIP for arm64 and x64
```

## Continuation plan (proposed, not completed)

The first pilot would ask a municipal housing analyst or housing nonprofit to independently review a small set of permits, including commercial-class housing, repairs, and blank descriptions. No partner or agency has agreed to a pilot.

1. **Validate decisions:** obtain independent labels before comparing results; report disagreement by count type and source ambiguity, not an invented overall accuracy score.
2. **Measure usefulness:** compare time and correction counts for the same review task using the raw source and HomeSignal. The target is a faster cited handoff with no increase in unsupported claims; no time saving has yet been measured.
3. **Maintain provenance:** refresh a versioned snapshot, review schema/privacy changes, and require re-review whenever source text changes. Current exports exclude reviews whose source hash no longer matches.
4. **Expand only after validation:** assess genuine model extraction against those labels; extend the separately labeled rent/community context only after validating geography, period, definition, and uncertainty reconciliation.

The product combines a permit-evidence workflow with separately labeled monthly metro rent and city community context. It does not measure household flows, completion, displacement, or neighborhood affordability, and has not been tested by an external practitioner.

## License and attribution

Application code is provided for the hackathon submission. Permit data remains a City of Pittsburgh dataset published by WPRDC under Creative Commons Attribution. Prototype review is not an official City determination.

## Benefits, risks, and unanswered questions

Planners, advocates, and journalists can trace public housing claims to source evidence. Residents benefit from clearer distinctions between proposed work and occupied homes. Incomplete descriptions and uneven reporting can hide activity; using them to label neighborhoods, direct investment, allocate benefits, or automate enforcement could harm residents. Do not use this prototype for those decisions. Humans must verify source meaning and current City records.

The Queue also includes monthly Zillow metro rent and Census city survey context. See [Sources](./SOURCES.md) for datasets, retrieval dates, definitions, and reconciliation. We lack reliable linked completion, occupancy, household-flow, displacement, and neighborhood affordability data, so HomeSignal does not answer those questions.
