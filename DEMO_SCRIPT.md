# HomeSignal — Natan's recording script

**Target: 4:00–4:30. Hard limit: 5:00.** Read only the quoted paragraphs. Actions and timing are not narration. This script uses eight stops; do not improvise a tour of every control.

## Before pressing Record

- Open **http://localhost:3090/**, the current production build. The older 3093 tab is not the recording target.
- Use 100% zoom and a wide browser window. Close developer panels and keep this script beside the recording window.
- Start with **2025 / All / All / Housing**, an empty search, **0 Human reviewed**, and **727 Needs review**. Use a fresh browser session if your own reviews are present; do not erase work you need.
- Rehearse once without recording. Record the actual application during the event weekend. Keep the finished video public, as required by the participant packet.
- Start a timer. Speak at a calm pace; pause during clicks. Timing is an estimate, not a guarantee.

## 1. 0:00–0:25 — Introduce the problem

**ACTION:** Keep the Queue at the top. Start recording. Move the pointer away from the text.

> I'm Natan, the solo builder of HomeSignal for the AI for Housing Hackathon, Track 2. Planners, advocates, and journalists need to understand housing activity. But permit lists bury useful evidence in descriptions. HomeSignal turns those records into a cited review workflow.

## 2. 0:25–0:50 — Show discovery

**ACTION:** Scroll to **Queue totals** and the monthly chart. Point to **4,243**, then **727**. Do not change filters.

> Here are 4,243 Pittsburgh building-permit records issued in 2025. Transparent keyword and work-type rules identify 727 candidates for housing review. Search, neighborhood filters, and monthly activity help people explore the snapshot. These are permit records, not completed homes.

## 3. 0:50–1:20 — Show the observatory context

**ACTION:** Expand **Housing context: rents & community**. Briefly show the Zillow and Census cards. Scroll to **How we reconcile the sources**, then collapse the panel.

> Zillow adds monthly metro rent context; Census adds city rent and residential-stability estimates. Different geographies, periods, and definitions stay visible. We don't force these into one measure or claim permits caused rent changes. We lack reliable linked household-flow data, so we don't claim to measure it.

## 4. 1:20–1:55 — Extract evidence

**ACTION:** Click the **Example record BDA-2024-05307 — Open record** card. Point at **12 DWELLING UNITS** in the source. Click **Extract demo evidence** and wait for the count and quote.

> This record mentions twelve dwelling units. Extract demo evidence proposes the count with its exact quote, ready for review. The snapshot, filters, review, and export work. The extraction and analysis here are deterministic simulations; no external AI model is called. Coding assistants helped develop the application.

## 5. 1:55–2:35 — Show what the analysis supports

**ACTION:** Scroll to **What this record supports**. Click **Analyze this record**. Wait for the three decision-support lists. Point to each heading without reading every bullet.

> The analysis separates what the record establishes, what it does not establish, and what to verify next. Twelve units mentioned does not prove twelve homes were built or occupied. Evidence coverage names missing information instead of inventing confidence scores. The simulated provider demonstrates the intended workflow behind a working API.

## 6. 2:35–3:05 — Verify and accept

**ACTION:** Under **Evidence coverage**, click **Show in source** beside **Dwelling-unit language**. Let the page scroll to the highlighted quote. In the Review card, click **Accept supported demo fields**. Point at **Accepted by reviewer**.

> Show in source takes me back to the supporting words. I inspect the description, then accept the fields. That decision belongs to the reviewer. The analysis cannot approve a record for me.

## 7. 3:05–3:30 — Show the useful output

**ACTION:** Click **Briefing** in the navigation or review actions. Show the **12**, quotation, source citation, and the **Print / Save as PDF** and **Download reviewed CSV** buttons. Do not open a print dialog while recording.

> The briefing turns reviewed evidence into a handoff: the count, quote, citation, and verification steps. It can be printed or exported as reviewed CSV. Unreviewed candidates never become findings, and unit mentions are never summed into a citywide homes-built total.

## 8. 3:30–4:15 — Explain risks and the next step

**ACTION:** Scroll to **Before this informs a housing decision**. Keep the City verification link visible. Finish speaking, pause for two seconds, and stop recording.

> Missing descriptions and keyword errors can distort the picture. Misreading it could stigmatize neighborhoods or misdirect resources. Owner, contractor, address, and parcel fields are excluded; free-text redaction can still be incomplete. Consequential decisions require verification with City staff. This is decision support, not legal, financial, or zoning advice.
>
> Next, I'd test with housing practitioners, measure review time and corrections, then evaluate a live model. HomeSignal makes housing evidence easier to inspect—and its limits harder to miss.

## If the timer runs long

- At **3:45**, move directly to Briefing if you are not there already. Skip further clicking and read the closing.
- Do not open Technical details, read every finding, demonstrate all filters, or add unscripted explanations.
- If a button fails, say “That action isn't responding in this recording,” show the source and working review path, and continue. Do not imply it succeeded.
- Optional follow-up questions and Copy record summary are additional controls, but are outside this timed recording path.

**Suggested video title:** HomeSignal | From Permit Records to Reviewed Housing Evidence | AI for Housing Hackathon
