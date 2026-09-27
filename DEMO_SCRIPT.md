# HomeSignal — judge demo script

**Target: 4:00–4:30. Hard limit: 5:00.** Read the quoted narration. The action notes are not spoken.

## Before recording

- Open **http://localhost:3090/** at 100% zoom in a wide window.
- Start with **2025 / All / All / Housing**, an empty search, **0 Human reviewed**, and **727 Needs review**.
- Rehearse once. Pause after clicks so each result is visible.

## 1. 0:00–0:25 — Problem and value

**ACTION:** Begin at the top of the Queue.

> I'm Natan, the solo builder of HomeSignal for the AI for Housing Hackathon, Track 2. Public permit data can reveal possible housing activity, but the useful evidence is buried in thousands of descriptions. HomeSignal turns that data into a searchable, cited workflow where a person reviews every finding before it can be exported.

**KEY FEATURE:** Evidence discovery without presenting permits as completed housing.

## 2. 0:25–0:55 — Transparent housing queue

**ACTION:** Show **Queue totals**, the monthly chart, and the filters. Point to **4,243** issued records and **727** potential housing records.

> This frozen 2025 Pittsburgh snapshot contains 4,243 issued permit records. Transparent keyword and work-type rules narrow them to 727 potential housing records. Judges can inspect the full issued cohort, filter by neighborhood and review status, search permit IDs, and see monthly administrative activity. These are permit records—not construction starts, completed homes, or occupancy.

**KEY FEATURES:** Reproducible candidate rules, filters, search, and clearly defined metrics.

## 3. 0:55–1:20 — Housing context without false comparisons

**ACTION:** Expand **Housing context: rents & community**. Show the Zillow and Census cards and **How we reconcile the sources**, then collapse the section.

> HomeSignal keeps permit evidence beside relevant housing context. Zillow provides a monthly Pittsburgh-metro rent index, while Census provides city estimates for gross rent and residential stability. Their geography, period, and definition remain visible. HomeSignal does not combine unlike measures, attribute metro rents to neighborhoods, or claim permits caused rent changes.

**KEY FEATURE:** Multiple sources remain separate, cited, and definition-aware.

## 4. 1:20–1:55 — Source-bound extraction

**ACTION:** Open **Example record BDA-2024-05307**. Point to **12 DWELLING UNITS** in the public description. Click **Extract demo evidence** and wait for the proposed count and quote.

> The source description explicitly mentions twelve dwelling units. The extraction proposes a structured count and preserves the exact supporting quote, but it does not call that number homes built. The reviewer can compare every proposed field directly with the source text.
>
> In a live deployment, this extraction endpoint could connect to an AI API. For this demo, it uses a deterministic local simulation and does not retrieve live AI information.

**KEY FEATURES:** Structured extraction, exact quotations, and visible provenance.

## 5. 1:55–2:35 — Decision support with explicit limits

**ACTION:** Scroll to **What this record supports**. Click **Analyze this record**. Point to the three columns and the evidence-coverage rows.

> The evidence brief separates three questions: what this record establishes, what it does not establish, and what must be verified next. It correctly says that a mention of twelve units does not prove construction, completion, or occupancy. Evidence coverage also identifies missing checks, including related permits, instead of inventing certainty.
>
> In a live deployment, this analysis endpoint could use an AI API. In this demo, no external model is called and no live information is retrieved.

**KEY FEATURES:** Source-bound claims, non-claims, verification steps, and no fabricated confidence score.

## 6. 2:35–3:05 — Human review and citation tracing

**ACTION:** Click **Show in source** beside **Dwelling-unit language**. Let the quote scroll into view. Click **Accept supported demo fields** and show **Accepted by reviewer**.

> Show in source returns directly to the cited words. I verify the quote and meaning, then accept the supported fields. Only a person can save that decision; the extraction and evidence brief cannot approve a record. Rejected and insufficient-evidence outcomes are also available.

**KEY FEATURES:** Citation tracing, human-in-the-loop approval, and auditable review states.

## 7. 3:05–3:35 — Briefing and export

**ACTION:** Open **Briefing**. Show the count, quote, citation, verification section, **Print / Save as PDF**, and **Download reviewed CSV**.

> The briefing converts reviewed evidence into a practical handoff: the permit ID, structured count, exact quote, source citation, limitations, and who should verify the record next. It can be printed or downloaded as reviewed CSV. Unreviewed candidates are excluded, and unit mentions are never summed into a citywide homes-built total.

**KEY FEATURES:** Review-gated export, citations, printable briefing, CSV, and a clear verification owner.

## 8. 3:35–4:20 — Safety, limitations, and next step

**ACTION:** Keep **Before this informs a housing decision** and the official City guidance link visible.

> HomeSignal is decision support—not a City determination or legal, financial, or zoning guidance. Missing descriptions and keyword errors can create false negatives or false positives. Owner, contractor, street-address, contact, and parcel fields are excluded, although free-text redaction may still be incomplete. Any consequential use requires checking current official records with City staff.
>
> Next, I would test the workflow with housing practitioners, measure review time and correction rates, and evaluate a live model against this source-bound process. HomeSignal's core value is simple: make housing evidence easier to find, easier to verify, and harder to overstate.

## If time runs short

- At **3:40**, move to **Briefing** and deliver the final two sections.
- Do not read every bullet, open technical details, or demonstrate every filter.
- If an action fails, state that it did not respond and continue with the visible source and review path.

**Suggested title:** HomeSignal | From Permit Records to Reviewed Housing Evidence | AI for Housing Hackathon
