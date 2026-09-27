# Video script (3–5 minutes; speak this, don’t put it on the screens)

Record the **running app** (http://127.0.0.1:3030 in this workspace, or `npm start` after `npm run build`, or a desktop package you actually launched). This file is not a video.

Fill **[your name]** yourself. Public repo: https://github.com/Run-Disc/HomeSignal

On screen: **Queue → Start the guided demo → Record → Save → Briefing**. Keep caveats in your voice.

Do not say the City validated this, that a model is accurate, that Cursor is analyzing the permits live, that zoning was checked, that a host is live unless you opened it, or that you found N homes built.

---

**0:00–0:35 — What this is**

Show Queue. Point at Issued permit records / Potential housing records / Human reviewed / Needs review.

“I’m **[your name]**. This is HomeSignal for the AI for Housing Hackathon. Pittsburgh already has tools like the Affordable Housing Development Project Explorer, and a 2025 Controller report asked for a broader housing-development dashboard. This is a different job: a privacy-reduced review of issued permit descriptions. An analyst opens the text, keeps exact quotes, and does not treat a permit record as a finished home.”

Point briefly to the monthly bars: “This is issued-record activity over the selected year and neighborhood. It is not a homes-built chart.”

**0:35–1:05 — Where the data came from**

Click **Snapshot 2026-09-26** in the header if you want the source list on screen; you can also stay on Queue.

“The source is City of Pittsburgh PLI Permits on WPRDC, Creative Commons Attribution, downloaded 2026-09-26. The dump had 65,378 rows; the catalog preview still showed 49,255. We used the dump. The cohort is 2025 Building or Building and Development Application: 4,243 IDs. 727 sit in the housing queue because of a keyword or work-type rule, including commercial class. 2,417 descriptions are blank. Zoning code and map are listed on Sources for later lookup — most building permits need zoning approval, and rules vary by location — but this app does not score zoning.”

**1:05–2:00 — One real record**

Click **Start the guided demo — BDA-2024-05307**.

“Middle Hill. Commercial class. New construction. Status Issued. The description says a new four-story building with future commercial space on the first floor and total of 12 dwelling units above. That’s proposed-unit language on an issued permit. It is not twelve occupied homes. Address, owner, and contractor are not on this screen.”

**2:00–2:25 — No runtime AI on this build**

Do not wait for a spinner. Open **Extract** only if you need to show it is empty.

“Before the build window, AI consultation helped with public-source research and early sketches, but no application code existed. During the event, Cursor helped me develop the software. It is not running against these permits. There is no runtime model key and no saved model answer. What you see is the snapshot plus whatever I type.”

**2:25–3:20 — Human review**

Set Housing to housing-related. Scope to new building. Count type: proposed total. Count: 12. Select `TOTAL OF 12 DWELLING UNITS ABOVE` in the source and click **Use selected text as quote**. Click **Save**.

“I’m saving a local review because that exact sentence is on the left. This is not a City determination. If the text were blank or ‘no work,’ I would use Insufficient evidence instead of inventing a number.”

**3:20–4:10 — Briefing**

Click **Briefing**.

“This is the note you’d actually send. Print or CSV. Only reviews I saved show up as findings. Unreviewed IDs stay out. There is no citywide homes-built total. Next step for a real analyst is OneStopPGH or PLI, not this prototype.”

**4:10–4:40 — Close**

Optional: click **Methods & limits** for two seconds.

“If this continued, I would finish independent labels on the small corpus, then maybe turn on a paid extraction key with a spend cap. Nobody at the City has agreed to a pilot.”

Stop before 5:00.

---

Skip anything that is not on screen. Do not fake a model response.
