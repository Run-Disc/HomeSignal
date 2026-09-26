# Demo script (3–5 minutes; target about 4:00)

Record the **running application** (local `npm run dev` / `npm start`, or a host you personally verified). Do not narrate missing features. Fill `[your name]` and `[optional affiliation]` yourself. This script is not a recorded video.

Public repository: https://github.com/Run-Disc/HomeSignal
On-screen path: Overview → search `BDA-2024-05307` → record review → Export → Limitations.

Do not say the City validated this, that the model is accurate, that a Vercel host is live unless you opened that URL yourself, or that you found N homes built.

---

**0:00–0:25 — Identity and problem**

Show Overview.

“This is my submission to the **AI for Housing Hackathon**, part of **AI Horizons 2026**. I’m **[your name]**[, **optional affiliation**]. HomeSignal is a Track 2 permit-evidence observatory for Pittsburgh. It helps a housing analyst inspect issued PLI permit descriptions. A permit record is not a housing unit, and an issued permit is not a completed or occupied home.”

Point to the four metric cards. They count **issued records**, not homes built.

**0:25–0:55 — Source and cohort (what exists)**

Open **Sources** (or read the snapshot pill: 2026-09-26).

“The source is City of Pittsburgh PLI Permits published by WPRDC, Creative Commons Attribution, resource `f4d1177a-f597-4c32-8cbf-7885f56253f6`, downloaded 2026-09-26. This product uses the CKAN dump: 65,378 rows. The catalog HTML preview still listed 49,255; we document that disagreement and use the dump. The cohort is 2025 issue dates, Building or Building & Development Application: **4,243** unique permit IDs. **727** are potential housing candidates by keyword or work type, including commercial class, because Pittsburgh commercial records can contain housing. **2,417** cohort records have blank descriptions.”

Return to Overview.

**0:55–1:40 — Functional path: real commercial-class housing language**

Search `BDA-2024-05307` and open the record.

“This is Middle Hill, administrative class Commercial, work type New Construction, source status Issued. The sanitized description says: construct a new four-story building with future commercial tenant space on the first floor and **TOTAL OF 12 DWELLING UNITS ABOVE**. That is proposed-unit language on an issued permit. It is not proof that twelve homes exist, were completed, or are occupied. Parcel, owner, contractor, and street address are not shown.”

**1:40–2:20 — Functional vs unavailable (live AI)**

Read the **source-review** banner and the extraction status out loud.

“What works without a model: you can read the source text, record a human review, and export it. Live AI extraction is **implemented in code** (`POST /api/extract`) but **not available in this demo**: there is no runtime API key in the repository, and there are no saved genuine model responses. Cursor coding credits are not a visitor API key. The button says **Why AI extraction is unavailable**. It is not requesting extraction. I am not going to describe a missing call as AI analysis.”

Click that button once so the status stays honest, then continue.

**2:20–2:55 — Human-in-the-loop (functional)**

Set housing relevance to housing, proposed scope to new building. Paste the exact excerpt `TOTAL OF 12 DWELLING UNITS ABOVE` and enter proposed total **12** only because that quote is on screen. Click **Correct**. Show the local review badge.

“This is my local browser review, labeled as a local reviewer. It is not a City determination. Decision support only: verify with PLI or OneStopPGH.”

Return to Overview so **Reviewed** / **Needs review** change. Mention: those counts still do not add to a citywide homes-built total. Records with an explicit proposed-unit mention are counted as **records**, not as 12 homes.

**2:55–3:25 — Export (functional)**

Open **Export briefing**. Show Print / Save as PDF and CSV. Scroll the text: snapshot date, source, record metrics, the 12-unit quote if reviewed, next-step verification language, and the permit-is-not-a-unit limitation.

“CSV is reviewed evidence only and formula-escaped. Owner names and addresses are not in the export.”

**3:25–3:50 — Limitations**

Open **Limitations** (or read from the briefing).

“This source cannot support a proposed-to-issued-to-completed funnel. Status is a current label, not a timeline. Unit numbers may mean existing, proposed, added, removed, or unrelated work. Stories and bedrooms are not units. Candidate keywords are a discovery aid, not completeness. Automated redaction of free text is incomplete. The evaluation labeling sheet is unlabeled, so I am not reporting an accuracy percentage.”

**3:50–4:10 — What would be built next (not built)**

“Next, if this were continued: I would complete independent labels on the bounded review corpus, then optionally enable live extraction with a separate paid key and spending limits, and only then talk with a data steward about project linkage. No agency has agreed to a pilot. Maps, extra years, ACS rent, accounts, and citywide unit totals were deferred on purpose.”

Stop. Total target ~4:00 (stay under 5:00).

---

**If something is not on screen, skip it.** Optional 15 seconds only if time remains: `BDA-2025-01572` (“NO WORK” / unit language) as an ambiguous case you would mark insufficient rather than invent a count.
