# HomeSignal

HomeSignal is a Pittsburgh permit-evidence observatory for the AI for Housing Hackathon (AI Horizons 2026), Track 2: Housing Production, Rents & Household Flow Observatory.

**One sentence:** it helps a housing analyst turn messy PLI permit descriptions into reviewable evidence about proposed housing activity, while keeping record counts, proposed-unit mentions, and completed homes distinct.

A permit record is not a housing unit. An issued permit is not a completed home.

## Run locally

Requires Node.js 22+ (this repo can use `.tools/node` if Node is not on PATH) and the sanitized snapshot already in `data/public/permits-2025.json`.

```bash
export PATH="$PWD/.tools/node/bin:$PATH"   # only if Node is not on PATH
npm install
npm test
npm run dev
```

Open http://localhost:3000

Optional live extraction (server-side only): copy `.env.example` to `.env.local` and set `EXTRACTION_API_KEY` and `EXTRACTION_MODEL`. Cursor coding credits are not a runtime API key. Without a key, source review and export still work.

```bash
npm run build
npm start
```

## What is in the snapshot

- Source: City of Pittsburgh PLI Permits via WPRDC, resource `f4d1177a-f597-4c32-8cbf-7885f56253f6`
- Download date: 2026-09-26
- Cohort: issue year 2025, `permit_type` `BUILDING` or `Building & Development Application`, all administrative classes
- 4,243 unique permit IDs after ingest
- 727 potential housing candidates (project keyword/work-type discovery)
- 120-record AI allowlist; 20 comparison records without those keywords
- Owner, contractor, street address, coordinates, and project value are not in the public snapshot

See `SOURCES.md`, `DATA_DICTIONARY.md`, `LIMITATIONS.md`, `AI_DISCLOSURE.md`, and `EVALUATION.md`.

## License and attribution

Application code is provided for the hackathon submission. Permit data remains a City of Pittsburgh dataset published by WPRDC under Creative Commons Attribution. Do not treat prototype review as an official City determination.
