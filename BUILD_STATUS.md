# HomeSignal BUILD_STATUS

Updated: 2026-09-27 (final judging, security, product, and documentation pass)

## Stage

Public `main` product UI: Queue / Record / Briefing. Runtime **source-review** plus **simulated DemoAIProvider** (no vendor key). `saved-extractions.json` is `[]`. No demo video, hosted URL, identity, or form submission is claimed.

Deadline: Sunday 2026-09-27 23:59 ET.

## Source (unchanged)

- Resource: `f4d1177a-f597-4c32-8cbf-7885f56253f6`
- Dump rows: **65,378**; catalog HTML preview still listed **49,255**; product uses the dump
- 2025 Building / BDA unique IDs: **4,243**; candidates **727**; blank descriptions **2,417**
- Snapshot version: `pli-2025-bda-v1`
- Snapshot sha256: `283a311a5dde72bacf863a8dfe638ca62f624e45af17d97d0c3b4218a9dabf3d`

## Product

- Header: HomeSignal + Queue / Record / Briefing. Snapshot date and Docs are quiet links.
- Queue: compact metrics, a neighborhood-responsive 2025 issued-record activity chart, spotlight `BDA-2024-05307`, filters, and table. The chart explicitly does not claim homes built.
- Record: source text + review form with selection-to-quote evidence capture. Labeled demo extraction and a simulated evidence brief (`POST /api/ai/analyze`) are visible on the record. Demo outputs cite this row only and are not mixed into queue totals.
- Briefing: preserved neighborhood/search filters, visible export scope, featured evidence, optional labeled demo brief, official verification handoff, unclipped print output, and CSV containing all count quotes and source provenance.
- Zoning and comparable City tools: Sources lists the Affordable Housing Development Project Explorer, the June 2025 Controller dashboard recommendation, and zoning code/map/page as unused future links.

## Desktop

- Unsigned Windows NSIS: `HomeSignal-Setup.exe` (SmartScreen expected). Workflow job `windows` on `windows-latest`; distributed as a workflow artifact and tagged Release asset because the current installer exceeds the repository's single-file limit.
- Unsigned macOS DMG + ZIP for **arm64** and **x64**: `HomeSignal-mac-{arch}.dmg|.zip` (Gatekeeper expected; not notarized). Independent `macos` matrix jobs on `macos-latest` prevent one architecture’s disk-image step from blocking the other.
- Tagged `v*` builds attach all five package files to a public GitHub Release.
- Mac binaries are not stored in the git root.

## Checks

- `npm run lint`: pass; generated builds and desktop artifacts are excluded from lint while checked source and scripts remain included.
- `npx tsc --noEmit`: pass
- Record: source / extracted fact / AI interpretation are labeled separately. Review actions stick to the bottom of the review card. Below about 820px viewport height the top bar is not sticky, so Accept stays clickable.
- `npm test`: **54/54 pass** after the decision-support, status-chip, and copied-summary tests.
- `npm run build`: pass (Next.js 15.5.26).
- `npm audit`: **0 vulnerabilities** after updating Electron to 44.4.5, electron-builder to 26.15.3, and overriding PostCSS to 8.5.28.
- `node scripts/validate-electron.cjs`: pass (syntax + mac DMG/ZIP + win NSIS config; `identity: null`)
- `node scripts/prepare-standalone.cjs` + `validate-standalone.cjs`: pass (no `.env`, no parcel fields)
- Local unsigned macOS package on Darwin: `HomeSignal-mac-arm64.dmg|.zip` and `HomeSignal-mac-x64.dmg|.zip` in `dist-desktop/` (gitignored). Signing skipped (`identity` null). First dual-arch DMG pass hit a transient `hdiutil detach` on `/Volumes/HomeSignal`; retry of arm64 DMG succeeded. GitHub Actions `macos-latest` rebuilds these for artifacts/releases.
- Windows NSIS remains CI-built on `windows-latest` (`HomeSignal-Setup.exe`). SmartScreen and Gatekeeper warnings are expected for unsigned files. A stale repository-root installer was removed; use the tagged Release.
- The previously combined dual-architecture macOS workflow repeatedly failed even though local packaging succeeded. The final workflow builds and uploads arm64 and x64 independently.
- The package workflow no longer tries to commit generated binaries back to `main`; a current Windows installer is larger than GitHub's repository file limit. Workflow artifacts and Release assets preserve all packages without failing the run.
- Desktop renderer isolation remains enabled (`contextIsolation`, sandbox, and no Node integration). Browser permissions are denied, and external HTTP(S) links open outside the HomeSignal window.
- Windows and macOS packages use the HomeSignal application icon rather than Electron’s generic icon.

`POST /api/extract` remains without a vendor key. Demo extraction and `POST /api/ai/analyze` are local simulated providers. No genuine saved vendor responses. Synthetic evaluation strings stay out of the snapshot.

## Builder-only remaining actions

Team name, demo video URL, hosted URL, eligibility attestation, and event-form submission remain human-only. See `COMPLIANCE_AUDIT.md`.

## Final review update (v0.1.2)

- Added real Zillow metro monthly rent and Census city community context, with separate geography/period/definition labels and downloadable provenance. Context is excluded from permit-export calculations.
- Added explicit beneficiaries, potential harms, missing data, and human verification questions.
- Browser rehearsal verified Middle Hill (17 issued / 4 candidates), rejection of a count without a quote, a sourced 12-unit mention, preserved filters, and a briefing with one local review / three remaining candidates. Month selection changed the Zillow display from December $1,423 to January $1,372. No browser console errors were reported in the rehearsed flow.
- Narrow-width queue and briefing had no document-level horizontal overflow in the browser check.
- No external practitioner validation or measured extraction accuracy is claimed.

## Rubric pass (2026-09-27)

- Record brief now shows **What the record establishes / What it does not establish / What to verify next** (conditional, never claims other records exist) and an evidence-coverage list with status words instead of confidence percentages. A "Completed" source status is described as an administrative label, not confirmed completion.
- Human-in-the-loop status chips: **Extracted — review required** until a person saves; then **Accepted by reviewer**, **Corrected by reviewer**, and so on. The AI panel is labeled **AI interpretation — non-authoritative** and shows the reviewer decision separately.
- Each cited quote has **Show in source**, which highlights the exact text in the source card. **Copy record summary** copies source facts, reviewer status, and the labeled simulated AI section.
- `/api/ai/analyze` and `/api/ai/ask` now validate provider responses against the Zod schema before returning them. Cached briefs that do not match the current schema are ignored.
- Queue adds a short manual-versus-HomeSignal comparison. README adds problem framing, Track 2 fit, source establishes/does-not-establish notes, and a phased continuation plan. EVALUATION lists planned pilot measurements. DEMO_SCRIPT is a timed 3:15–4:00 script.
- Browser check on the production build at http://localhost:3090: fresh state; flagship extraction gives 12; brief, Show in source, occupancy answer, Accept, Copy, refresh persistence, and Briefing all verified. No document-level horizontal overflow at 390×844, 900×800, 1280×720, 1280×650, or 1440×900.
