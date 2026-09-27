# HomeSignal demo video — final script

**Target length:** 4:00–4:30. The event limit is 3–5 minutes.

This is a word-for-word narration with matching screen actions. Replace **[your name]** before recording. Speak at a calm pace and let the screen prove each claim.

## Prepare before recording

1. Open the running app. On this computer, use `http://127.0.0.1:3091/`. A normal local or desktop build may use a different local port.
2. Use a 1280×900 or larger browser window at 100% zoom. Hide bookmarks, notifications, and unrelated tabs.
3. Open the guided record once. If it shows an earlier decision, click **Undo** once. Return to **Queue** and scroll to the top.
4. Keep the filters at **2025 · All neighborhoods · All statuses · Housing**.
5. Practice selecting the exact words `TOTAL OF 12 DWELLING UNITS ABOVE` before recording.
6. Do not open **Extract**. Runtime AI is intentionally disabled in this submission.
7. Record the app window, your microphone, and cursor. Pause briefly after every click.

---

## 0:00–0:30 — Hook and problem

**On screen:** Queue, top of page. Keep the workflow and four totals visible.

**Say:**

“A permit description can mention twelve dwelling units. That does **not** mean Pittsburgh gained twelve completed homes. It means an analyst has a lead that still needs evidence.

I’m **[your name]**, and this is HomeSignal. It turns a large public permit list into a simple workflow: find a possible housing signal, verify it against the exact source text, and brief only what a human has reviewed.”

## 0:30–1:05 — Regional signal without overclaiming

**On screen:** Point to **Issued permit records**, **Potential housing records**, and the monthly chart. Scroll only enough to keep the chart and guided-demo card visible.

**Say:**

“The 2025 snapshot contains 4,243 issued Building or Building and Development Application records. Transparent keyword and work-type rules place 727 in the review queue.

The chart shows when issued permit records appeared during the year. It can be filtered by neighborhood, but it is deliberately labeled as permit activity — not construction starts, occupancy, or homes built. HomeSignal helps planners, housing nonprofits, and reporters move from that regional pattern to the underlying record.”

## 1:05–1:30 — Data integrity

**On screen:** Click **Sources, snapshot retrieved 2026-09-26** in the header. Briefly show the source and reconciliation sections. Then return to **Queue**.

**Say:**

“The source is City of Pittsburgh PLI Permits through WPRDC under Creative Commons Attribution, retrieved September 26. The downloaded dump contained 65,378 rows while the catalog preview showed 49,255, so HomeSignal documents the disagreement and uses the downloaded file.

The public snapshot omits names, addresses, parcels, contacts, coordinates, and project values. Blank descriptions stay blank.”

## 1:30–2:10 — A real permit-level question

**On screen:** Click **Start the guided demo — BDA-2024-05307**. Point to the metadata, then the source description.

**Say:**

“Here is the real question. This issued Middle Hill record is classified commercial, but the description says it is a new four-story building with future commercial space on the first floor and ‘total of 12 dwelling units above.’

That makes it relevant to housing. But the wording supports only a proposed total mentioned in an issued permit. It does not prove twelve added, completed, or occupied homes. HomeSignal keeps those meanings separate instead of turning one number into a misleading production statistic.”

## 2:10–2:55 — Human review with exact evidence

**On screen:**

1. Set **Housing** to **Housing-related**.
2. Set **Scope** to **New building (project label)**.
3. Set **Count type** to **Proposed total units mentioned**.
4. Enter `12` in **Count**.
5. Select `TOTAL OF 12 DWELLING UNITS ABOVE` in the source description.
6. Click **Use selected text as quote**.
7. Click **Save**.

**Say while completing the fields:**

“I classify only what the description supports: housing-related, new building, proposed total, twelve. Then I select the exact source words and attach them as evidence.

That quote is the safeguard. A reviewer can immediately challenge the interpretation. If the description were blank or ambiguous, I would choose **Insufficient evidence** and leave the count unknown. The decision stays in this browser and is labeled as a local human review, not a City determination.”

## 2:55–3:30 — From evidence to an actionable briefing

**On screen:** Click **Briefing**. Point to the record ID, classification, count type, count, and supporting quote. Briefly point to **Print briefing** and **Download reviewed CSV**.

**Say:**

“Now the reviewed fact becomes a briefing. The permit ID, interpretation, proposed count, and exact quote travel together. An analyst can print the page or download a reviewed CSV.

Only saved human reviews enter this output. Unreviewed records do not silently become findings, and HomeSignal never adds the queue into a citywide homes-built total. The next verification step can happen in the official permit system with the evidence already organized.”

## 3:30–4:05 — Responsible AI and limitations

**On screen:** Click **Methods & limits**. Pause on the human-review and limitations sections.

**Say:**

“This submission has no runtime model key and no saved model answers. Before the event, AI consultation supported public-source research and early sketches, with no application code. During the build window, Cursor assisted software development. It does not analyze permits while HomeSignal runs.

The tool also does not score zoning, predict feasibility, or identify individuals. Those boundaries are visible because decision support is useful only when users can see what the data can and cannot establish.”

## 4:05–4:25 — Close

**On screen:** Return to **Queue** so the product name, workflow, and reviewed count are visible.

**Say:**

“The next step is practitioner testing, independent labels, and current permit-status connections. Optional extraction could come later with evaluation, a controlled key, and spending limits — while keeping every number tied to its source.

HomeSignal makes the path clear: see the pattern, verify the record, and brief only what the evidence supports.”

**Stop recording.**

---

## Claims to avoid

Do not say any of the following:

- The City validated, endorsed, or piloted HomeSignal.
- Twelve units were built, added, completed, approved for occupancy, or occupied.
- The housing queue contains 727 housing projects or homes.
- Cursor, Grok, or another model analyzes permits at runtime.
- Zoning feasibility was checked.
- The redaction process guarantees that every possible identifier was removed.
- A public hosted app exists unless you personally opened and verified its URL.

If a screen does not match the narration, describe what is actually visible. Never fabricate a model response or edit the video to imply a feature ran when it did not.
