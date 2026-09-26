# Demo script (3–5 minutes; target about 4:00)

Record the **running application** (local `npm run dev` / `npm start`, or a host you personally verified). Do not narrate missing features. Fill `[your name]` and `[optional affiliation]` yourself. This script is not a recorded video.

Public repository: https://github.com/Run-Disc/HomeSignal
On-screen path: **1 Overview** → **Explore a real example** (`BDA-2024-05307`) → **Save source review** → **3 Export** → Limitations (quiet link in the header).

Do not say the City validated this, that the model is accurate, that a Vercel host is live unless you opened that URL yourself, or that you found N homes built.

---

**0:00–0:25 — Identity and problem**

Show Overview. Point to **Analyst decision this tool supports**.

“This is my submission to the **AI for Housing Hackathon**, part of **AI Horizons 2026**. I’m **[your name]**[, **optional affiliation**]. HomeSignal is a Track 2 permit-evidence observatory for Pittsburgh. It helps a housing analyst inspect an issued PLI description, decide what is supported, and export a follow-up note. A permit record is not a housing unit, and an issued permit is not a completed or occupied home.”

Point to the four metric cards: issued permit records, potential housing records, reviewed records, needs review. They count **records**, not homes built.

**0:25–0:50 — Source and cohort**

Read the snapshot pill: 2026-09-26. Optionally open **Sources**.

“The source is City of Pittsburgh PLI Permits published by WPRDC, Creative Commons Attribution, resource `f4d1177a-f597-4c32-8cbf-7885f56253f6`, downloaded 2026-09-26. This product uses the CKAN dump: 65,378 rows. The catalog HTML preview still listed 49,255. The cohort is 2025 Building or Building & Development Application: **4,243** unique IDs. **727** are potential housing candidates by keyword or work type, including commercial class. **2,417** cohort records have blank descriptions. The record table is paginated so the page stays scannable; search still reaches every matching ID.”

**0:50–1:35 — Real example, one click**

Click **Explore a real example (BDA-2024-05307)**.

“Middle Hill, administrative class Commercial, work type New Construction, source status Issued. The sanitized description says: construct a new four-story building with future commercial tenant space on the first floor and **TOTAL OF 12 DWELLING UNITS ABOVE**. That is proposed-unit language on an issued permit. It is not proof that twelve homes exist, were completed, or are occupied. Parcel, owner, contractor, and street address are not shown.”

Read **Why this record is in the queue** once. Say it is a keyword/work-type discovery aid that can miss records and can include false positives. It is not AI output.

**1:35–2:10 — Honest AI mode**

Read the **source-review** banner. Click **Why AI extraction is unavailable** once.

“Live AI extraction is implemented in code (`POST /api/extract`) but not configured here: there is no runtime API key, and there are no saved genuine model responses. Cursor coding credits are not a visitor API key. There is no Accept or Reject control because there is no proposal. I am not going to describe a missing call as AI analysis.”

**2:10–2:50 — Human source review**

Set housing relevance to housing, proposed scope to new building. Paste the exact excerpt `TOTAL OF 12 DWELLING UNITS ABOVE` and enter proposed total **12** only because that quote is on screen. Click **Save source review**. Show the local review badge and timestamp.

“This is my local browser review. It is not a City determination. Decision support only: verify with PLI or OneStopPGH.”

Optional 10 seconds: mention **Open an ambiguous case** (`BDA-2025-01572`, “NO WORK”) and that you would mark **Insufficient evidence** rather than invent a count. Do not enter a number on a blank or ambiguous description.

**2:50–3:20 — Export**

Click **Export with this example**. Show Print / Save as PDF and reviewed CSV. Read: export scope, denominators, the 12-unit quote, next verification question, and the permit-is-not-a-unit limitation.

“CSV is reviewed evidence only and formula-escaped. Unreviewed candidates are not listed as findings. Owner names and addresses are not in the export.”

**3:20–3:45 — Limitations**

Open **Limitations**.

“This source cannot support a proposed-to-issued-to-completed funnel. Status is a current label. Unit numbers may mean existing, proposed, added, removed, or unrelated work. The evaluation worksheet is unlabeled, so I am not reporting an accuracy percentage.”

**3:45–4:05 — Next (proposal only)**

“If this continued, I would complete independent labels on the bounded corpus, then optionally enable live extraction with a separate paid key and spending limits, and only then talk with a data steward about project linkage. No agency has agreed to a pilot.”

Stop. Stay under 5:00.

---

**If something is not on screen, skip it.** Do not wait for a model. Do not show Accept supported fields in this keyless demo.
