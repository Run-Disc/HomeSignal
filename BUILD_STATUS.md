# HomeSignal BUILD_STATUS

Updated: 2026-09-27 (final judging, security, product, and documentation pass)

## Stage

Public `main` product UI: Queue / Record / Briefing. Runtime **source-review**: no `.env.local`, no process extraction key, `saved-extractions.json` is `[]`. No demo video, hosted URL, identity, or form submission is claimed.

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
- Record: source text + review form with selection-to-quote evidence capture. Extract is collapsed. No fabricated model pane.
- Briefing: print / CSV of reviewed evidence.
- Zoning and comparable City tools: Sources lists the Affordable Housing Development Project Explorer, the June 2025 Controller dashboard recommendation, and zoning code/map/page as unused future links.

## Desktop

- Unsigned Windows NSIS: `HomeSignal-Setup.exe` (SmartScreen expected). Workflow job `windows` on `windows-latest`.
- Unsigned macOS DMG + ZIP for **arm64** and **x64**: `HomeSignal-mac-{arch}.dmg|.zip` (Gatekeeper expected; not notarized). Independent `macos` matrix jobs on `macos-latest` prevent one architecture’s disk-image step from blocking the other.
- Tagged `v*` builds attach those files to a GitHub Release.
- Mac binaries are not stored in the git root.

## Checks

- `npm run lint`: pass; generated builds and desktop artifacts are excluded from lint while checked source and scripts remain included.
- `npx tsc --noEmit`: pass
- `npm test` (`tsx --test`): **32/32 pass**
- `npm run build`: pass (Next.js 15.5.26).
- `npm audit`: **0 vulnerabilities** after updating Electron to 44.4.5, electron-builder to 26.15.3, and overriding PostCSS to 8.5.28.
- `node scripts/validate-electron.cjs`: pass (syntax + mac DMG/ZIP + win NSIS config; `identity: null`)
- `node scripts/prepare-standalone.cjs` + `validate-standalone.cjs`: pass (no `.env`, no parcel fields)
- Local unsigned macOS package on Darwin: `HomeSignal-mac-arm64.dmg|.zip` and `HomeSignal-mac-x64.dmg|.zip` in `dist-desktop/` (gitignored). Signing skipped (`identity` null). First dual-arch DMG pass hit a transient `hdiutil detach` on `/Volumes/HomeSignal`; retry of arm64 DMG succeeded. GitHub Actions `macos-latest` rebuilds these for artifacts/releases.
- Windows NSIS remains CI-built on `windows-latest` (`HomeSignal-Setup.exe`). SmartScreen and Gatekeeper warnings are expected for unsigned files.
- The previously combined dual-architecture macOS workflow repeatedly failed even though local packaging succeeded. The final workflow builds and uploads arm64 and x64 independently.
- Desktop renderer isolation remains enabled (`contextIsolation`, sandbox, and no Node integration). Browser permissions are denied, and external HTTP(S) links open outside the HomeSignal window.
- Windows and macOS packages use the HomeSignal application icon rather than Electron’s generic icon.

`POST /api/extract` remains unconfigured. No genuine saved model responses. Synthetic evaluation strings stay out of the snapshot.

## Builder-only remaining actions

See `FINAL_ACTIONS.md`.
