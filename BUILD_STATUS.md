# HomeSignal BUILD_STATUS

Updated: 2026-09-26 ~09:57 America/New_York

## Stage

Core product is running locally through Overview → record review → export. Live AI is implemented but not demonstrated (no runtime key; 0 saved genuine responses).

## Verified in this session

- Time gate: Saturday 2026-09-26 after 9:00 ET.
- PLI dump retrieved 2026-09-26 from `f4d1177a-f597-4c32-8cbf-7885f56253f6`. Downloaded rows 65,378 vs catalog HTML 49,255. Product uses the dump.
- 2025 Building / Building & Development Application unique IDs: 4,243. Candidates: 727. Blank descriptions: 2,417. Commercial-class housing language present (BDA-2024-05307).
- `npm test`: 17 passed, 0 failed. `npx tsc --noEmit` exit 0. `npm run build` succeeded (Next.js 15.5.26).
- Browser at http://localhost:3000: metrics 4243 / 727; search found BDA-2024-05307; review page showed Commercial class and “TOTAL OF 12 DWELLING UNITS ABOVE”; Ask AI returned the no-key unavailable banner; Correct stored “corrected · Your local review”; export text included that permit, 12, and the permit-is-not-a-unit limitation; sources listed CC-BY and 0 saved examples.

## Honest gaps

- No live model call has succeeded. Cursor credits are not a runtime API key.
- Evaluation sheet is unlabeled. No accuracy percentage.
- No public git remote, hosted demo, or weekend video.
- ACS, maps, extra years omitted.
- Event form not submitted.

## Run

```
cd homesignal
export PATH="$PWD/.tools/node/bin:$PATH"   # if node is not on PATH
npm install
npm run dev
```

Open http://localhost:3000

## Next builder actions (shortest)

1. Inspect `data/evaluation/labeling-sheet.json` and the review corpus yourself.
2. If you want live extraction, add `EXTRACTION_API_KEY` and `EXTRACTION_MODEL` in `.env.local` only.
3. Create a public repository from `homesignal/` and record the 3–5 minute demo.
4. Submit the event form yourself. Do not ask Cursor to attest eligibility.
