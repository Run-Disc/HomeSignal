# HomeSignal demo script (about 3:30, target range 3:15–4:00)

The story: a housing analyst has to say whether one Pittsburgh permit is evidence of new homes before it goes into a production memo. HomeSignal shows what the record says, what it does not prove, and what to check next.

**Say this plainly once, on camera:** the AI provider in this demo is simulated. No external model is called. The API contract, provider interface, schema validation, and quote grounding are real code; only the vendor call is replaced by a deterministic local provider.

## Pre-demo check (do all of these before recording)

| Check | How |
|---|---|
| Production build running | `npm run build && node scripts/prepare-standalone.cjs && PORT=3090 node .next/standalone/server.js`, then open http://localhost:3090. Not `npm run dev` (dev overlay badges can appear). |
| No API key | `EXTRACTION_API_KEY` unset. The extract button must read **Extract demo evidence**. |
| Fresh state | Open DevTools → Application → Local Storage → `localhost:3090` → clear, then close DevTools. Or use a fresh private window. |
| Flagship available | Queue shows the spotlight **BDA-2024-05307**. If not, click **Reset filters**. |
| AI cache cleared | On the record, no brief is visible. If one is, click **Clear demo brief**. |
| Viewport and zoom | Browser window about 1440×900; zoom 100%. |
| No dev panels | DevTools closed; no extension popups; bookmarks bar hidden. |
| Recording settings | 1080p or higher, 30 fps, system audio off, microphone on, cursor highlighting on if available. Do not record the Cursor IDE or terminal. |

## Timed script

| Time | Page and control | Say | Judge should look at |
|---|---|---|---|
| 0:00–0:25 | **Queue**, top of page | “Housing analysts start from permit lists like this: 4,243 issued building records in Pittsburgh for 2025. Unit counts are buried in free text, and an issued permit is not a finished home. HomeSignal is decision support, not permitting or legal advice.” | Intro paragraph and the **Manual today / With HomeSignal** boxes |
| 0:25–0:45 | **Queue**, metric cards and monthly chart | “Keyword and work-type discovery narrows this to a 727-record housing review queue. These bars count permit records, not homes.” | Metric cards and chart caption |
| 0:45–1:00 | Click the spotlight **BDA-2024-05307 → Review this record’s evidence** | “Let’s check one record the way an analyst would.” | Record page loads |
| 1:00–1:20 | **1 · Source** card | Read aloud: “TOTAL OF 12 DWELLING UNITS ABOVE.” “This sentence is the only evidence. Owner, contractor, and address fields were removed before the app ever saw the data.” | Source text |
| 1:20–1:45 | **Extract demo evidence** | “The extractor accepts only an explicit ‘N dwelling units’ phrase. Stories and parking don’t count.” Point at **12**, the quote, and the amber chip **Extracted — review required**. | Extracted fact callout and status chip |
| 1:45–2:25 | Scroll to **3 · AI interpretation — non-authoritative**, click **Analyze this record** | While status lines run: “This goes through the same API contract a production model would use, but the provider is simulated.” Then: “Three lists. What the record establishes: an issued permit that references 12 dwelling units. What it does not establish: construction, completion, occupancy. What to verify next, phrased conditionally: *if* you need delivered housing, check whether inspection or occupancy records exist.” | Decision-support columns |
| 2:25–2:45 | **Evidence coverage**, then **Show in source** on the dwelling-unit finding | “No fake confidence scores. Coverage says Explicit, Not established, or Not checked.” Click **Show in source**: “Every citation jumps back to the exact words.” | Coverage rows; the highlighted quote in the source card |
| 2:45–3:00 | Click **Does this mean homes were built?** | “The answer is no, with the issue date as its citation.” | Answer box |
| 3:00–3:20 | Scroll up to the review form, click **Accept supported demo fields** | “The AI never decides. A person does.” Point at the chip changing to **Accepted by reviewer**, and at the AI panel line **Reviewer decision: Accepted by reviewer**. | Status chip |
| 3:20–3:30 | Click **Copy record summary** | “One click puts a cited summary on the clipboard. The AI section is labeled simulated and non-authoritative.” | Status message under the button |
| 3:30–3:50 | Click **Briefing** in the action row | “The briefing contains only reviewed evidence: 12, its exact quote, the citation, and the verification handoff. It has no citywide homes-built total.” | Featured count, quote, verification box, labeled AI section |
| 3:50–4:00 | Stay on Briefing | “Next: a pilot with practitioners that measures review time, corrections, and citation usefulness, then a production model behind the same interface.” | — |

## What is real and what is simulated

- **Real:** the WPRDC snapshot, the privacy reduction, deterministic metrics, the `POST /api/ai/analyze` and `/api/ai/ask` routes with a 4,000-character body limit and strict Zod request/response schemas, the `RuntimeAiProvider` interface, quote grounding (every evidence quote must appear verbatim in the row), human review persistence, and export filtering.
- **Simulated:** the vendor call. `DemoAIProvider` builds the brief with deterministic rules instead of calling a model. Request IDs (`demo_req_…`), latency, and token counts are simulated and labeled so under **Technical details**. No tokens are billed.

## If something looks off

- Stale brief or missing decision lists: click **Clear demo brief**, then **Analyze this record**.
- Flagship missing: click **Reset filters**, then search `BDA-2024-05307`.
- Extract button says a model is waiting: a vendor key is set. Unset `EXTRACTION_API_KEY` and restart.
- Short laptop screen: under about 820px of height the top bar stops being sticky, and Accept stays in the bottom action row.
