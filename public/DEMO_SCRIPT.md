# HomeSignal — judge demo script

**Target: 4:00–4:30. Hard limit: 5:00.** Follow every numbered action in order. Read only the quoted narration.

## Before recording

- Open **http://localhost:3090/** at 100% zoom in a wide window.
- Start with **2025 / All / All / Housing**, an empty search, **0 Human reviewed**, and **727 Needs review**.
- Keep the pointer near the item you are discussing, but never cover a number or quotation.
- Rehearse once. Pause after clicks so each result is visible.

## 1. 0:00–0:25 — Problem and value

**EXACT ACTIONS:**
1. Open **http://localhost:3090/**.
2. Confirm **Queue** is selected in the top navigation.
3. Do not click anything during this paragraph.

> I'm Natan, the solo builder of HomeSignal for the AI for Housing Hackathon, Track 2. Public permit data can reveal possible housing activity, but the useful evidence is buried in thousands of descriptions. HomeSignal turns that data into a searchable, cited workflow where a person reviews every finding before it can be exported.

**KEY FEATURE:** Evidence discovery without presenting permits as completed housing.

## 2. 0:25–0:55 — Transparent housing queue

**EXACT ACTIONS:**
1. Scroll down until **Queue totals** and all four metric cards are visible.
2. Point to **4,243 Issued permit records**.
3. Point to **727 Potential housing records**.
4. Scroll just enough to show the monthly chart, then continue until the filter row is visible.
5. Point across **Issue year**, **Neighborhood**, **Status**, **Queue**, and **Search**. Do not change them.

> This frozen 2025 Pittsburgh snapshot contains 4,243 issued permit records. Transparent keyword and work-type rules narrow them to 727 potential housing records. Judges can inspect the full issued cohort, filter by neighborhood and review status, search permit IDs, and see monthly administrative activity. These are permit records—not construction starts, completed homes, or occupancy.

**KEY FEATURES:** Reproducible candidate rules, filters, search, and clearly defined metrics.

## 3. 0:55–1:20 — Housing context without false comparisons

**EXACT ACTIONS:**
1. Scroll upward to **Housing context: rents & community**.
2. Click the **Housing context: rents & community** disclosure once.
3. Point to **Observed market rent**, then **Median gross rent**, then **Same home one year earlier**.
4. Scroll inside the open section until **How we reconcile the sources** is visible.
5. Point to the Zillow and Census source links.
6. Click **Housing context: rents & community** again to collapse it.

> HomeSignal keeps permit evidence beside relevant housing context. Zillow provides a monthly Pittsburgh-metro rent index, while Census provides city estimates for gross rent and residential stability. Their geography, period, and definition remain visible. HomeSignal does not combine unlike measures, attribute metro rents to neighborhoods, or claim permits caused rent changes.

**KEY FEATURE:** Multiple sources remain separate, cited, and definition-aware.

## 4. 1:20–1:55 — Source-bound extraction

**EXACT ACTIONS:**
1. Scroll down to the filter row above the permit table.
2. Click the **Search** field.
3. Type **BDA-2024-05307** exactly.
4. Wait until the table shows one matching row.
5. In that row, click the permit ID **BDA-2024-05307**.
6. In the **1 · Source** card, point to **12 DWELLING UNITS** in the public description.
7. In **2 · Extracted evidence**, click **Extract evidence**.
8. Wait until the extracted fact, count **12**, and quote **12 DWELLING UNITS** appear.
9. Point briefly to **Status: Extracted — review required**.

> I can find a record directly by permit ID. This source description explicitly mentions twelve dwelling units. The extraction proposes a structured count and preserves the exact supporting quote, but it does not call that number homes built. The reviewer can compare every proposed field directly with the source text.
>
> In a production deployment, this extraction endpoint could connect to an AI API. This deployment uses a deterministic local simulation and does not retrieve live AI information.

**KEY FEATURES:** Structured extraction, exact quotations, and visible provenance.

## 5. 1:55–2:35 — Decision support with explicit limits

**EXACT ACTIONS:**
1. Scroll down to **3 · AI interpretation — non-authoritative**.
2. Click **Analyze this record**.
3. Wait until the three colored columns appear.
4. Point, in order, to **What the record establishes**, **What it does not establish**, and **What to verify next**.
5. Scroll slightly to **Evidence coverage** and point to **Construction completion**, **Occupancy**, and **Related permits**.

> The evidence brief separates three questions: what this record establishes, what it does not establish, and what must be verified next. It correctly says that a mention of twelve units does not prove construction, completion, or occupancy. Evidence coverage also identifies missing checks, including related permits, instead of inventing certainty.
>
> In a production deployment, this analysis endpoint could use an AI API. This deployment calls no external model and retrieves no live information.

**KEY FEATURES:** Source-bound claims, non-claims, verification steps, and no fabricated confidence score.

## 6. 2:35–3:05 — Human review and citation tracing

**EXACT ACTIONS:**
1. In **Evidence coverage**, find **Dwelling-unit language**.
2. Click the **Show in source** button on that same row.
3. Wait for the page to scroll to the highlighted **12 DWELLING UNITS** quote.
4. In the Review card, click **Accept supported fields**.
5. Point to **Status: Accepted by reviewer**.

> Show in source returns directly to the cited words. I verify the quote and meaning, then accept the supported fields. Only a person can save that decision; the extraction and evidence brief cannot approve a record. Rejected and insufficient-evidence outcomes are also available.

**KEY FEATURES:** Citation tracing, human-in-the-loop approval, and auditable review states.

## 7. 3:05–3:35 — Briefing and export

**EXACT ACTIONS:**
1. Click **Briefing** in the top navigation.
2. Wait for the page to load.
3. Point to the large **12**, then the quote **12 DWELLING UNITS**.
4. Point to the **Citation** line.
5. Scroll through the three evidence columns.
6. Continue to **Before this informs a housing decision**.
7. Point to **Print / Save as PDF** and **Download reviewed CSV**. Do not click either button.

> The briefing converts reviewed evidence into a practical handoff: the permit ID, structured count, exact quote, source citation, limitations, and who should verify the record next. It can be printed or downloaded as reviewed CSV. Unreviewed candidates are excluded, and unit mentions are never summed into a citywide homes-built total.

**KEY FEATURES:** Review-gated export, citations, printable briefing, CSV, and a clear verification owner.

## 8. 3:35–4:20 — Safety, limitations, and next step

**EXACT ACTIONS:**
1. Keep **Before this informs a housing decision** visible.
2. Point to **Who checks next**.
3. Point to **Open official permit guidance ↗** without clicking it.
4. Deliver the closing, pause for two seconds, then stop recording.

> HomeSignal is decision support—not a City determination or legal, financial, or zoning guidance. Missing descriptions and keyword errors can create false negatives or false positives. Owner, contractor, street-address, contact, and parcel fields are excluded, although free-text redaction may still be incomplete. Any consequential use requires checking current official records with City staff.
>
> Next, I would test the workflow with housing practitioners, measure review time and correction rates, and evaluate a live model against this source-bound process. HomeSignal's core value is simple: make housing evidence easier to find, easier to verify, and harder to overstate.

## If time runs short

- At **3:40**, move to **Briefing** and deliver the final two sections.
- Do not read every bullet, open technical details, or demonstrate every filter.
- If an action fails, state that it did not respond and continue with the visible source and review path.

**Suggested title:** HomeSignal | From Permit Records to Reviewed Housing Evidence | AI for Housing Hackathon
