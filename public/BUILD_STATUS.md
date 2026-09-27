# HomeSignal BUILD_STATUS

Updated: 2026-09-26 (desktop packages + product/docs pass)

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
- Queue: compact metrics, spotlight `BDA-2024-05307`, filters, table. Lecture copy is in `VIDEO_SCRIPT.md`, not on the screen.
- Record: source text + review form. Extract is collapsed. No fabricated model pane.
- Briefing: print / CSV of reviewed evidence.
- Zoning and comparable City tools: Sources lists the Affordable Housing Development Project Explorer, the June 2025 Controller dashboard recommendation, and zoning code/map/page as unused future links.

## Desktop

- Unsigned Windows NSIS: `HomeSignal-Setup.exe` (SmartScreen expected). Workflow job `windows` on `windows-latest`.
- Unsigned macOS DMG + ZIP for **arm64** and **x64**: `HomeSignal-mac-{arch}.dmg|.zip` (Gatekeeper expected; not notarized). Workflow job `macos` on `macos-latest`.
- Tagged `v*` builds attach those files to a GitHub Release.
- Mac binaries are not stored in the git root.

## Checks

- `npx tsc --noEmit`: pass
- `npm test` (`tsx --test`): **32/32 pass**
- `npm run build`: pass (Next.js 15.5.26). ESLint unused-var on review workspace was removed.
- `node scripts/validate-electron.cjs`: pass (syntax + mac DMG/ZIP + win NSIS config; `identity: null`)
- `node scripts/prepare-standalone.cjs` + `validate-standalone.cjs`: pass (no `.env`, no parcel fields)
- Local unsigned macOS package on Darwin: `HomeSignal-mac-arm64.dmg|.zip` and `HomeSignal-mac-x64.dmg|.zip` in `dist-desktop/` (gitignored). Signing skipped (`identity` null). First dual-arch DMG pass hit a transient `hdiutil detach` on `/Volumes/HomeSignal`; retry of arm64 DMG succeeded. GitHub Actions `macos-latest` rebuilds these for artifacts/releases.
- Windows NSIS remains CI-built on `windows-latest` (`HomeSignal-Setup.exe`). SmartScreen and Gatekeeper warnings are expected for unsigned files.

`POST /api/extract` remains unconfigured. No genuine saved model responses. Synthetic evaluation strings stay out of the snapshot.

## Builder-only remaining actions

See `FINAL_ACTIONS.md`.
