# Video script (3–5 minutes; speak this, don’t put it on the screens)

Record the **running app** (http://127.0.0.1:3030 in this workspace, or `npm start` after `npm run build`, or a desktop package you actually launched). This file is not a video.

Fill **[your name]** yourself. Public repo: https://github.com/Run-Disc/HomeSignal

On screen: **Queue → spotlight / Open → Record → Save → Briefing**. Keep caveats in your voice.

Do not say the City validated this, that a model is accurate, that Cursor is analyzing the permits live, that zoning was checked, that a host is live unless you opened it, or that you found N homes built.

---

**0:00–0:35 — What this is**

Show Queue. Point at Issued / Housing queue / Reviewed / Open.

“I’m **[your name]**. This is HomeSignal for the AI for Housing Hackathon. It’s a review workspace for Pittsburgh building permits. An analyst opens a description, records what the text actually supports, and exports a note. These numbers are issued permit records, not homes built. An issued permit is not a completed or occupied home.”

**0:35–1:05 — Where the data came from**

Click the date in the header (Sources) if you want the list on screen; you can also stay on Queue.

“The source is City of Pittsburgh PLI Permits on WPRDC, Creative Commons Attribution, downloaded 2026-09-26. The dump had 65,378 rows; the catalog preview still showed 49,255. We used the dump. The cohort is 2025 Building or Building and Development Application: 4,243 IDs. 727 sit in the housing queue because of a keyword or work-type rule, including commercial class. 2,417 descriptions are blank. Pittsburgh’s zoning code and zoning map are listed on Sources if someone wants to look them up — this app does not do zoning feasibility.”

**1:05–2:00 — One real record**

Click the spotlight row **BDA-2024-05307** (Open).

“Middle Hill. Commercial class. New construction. Status Issued. The description says a new four-story building with future commercial space on the first floor and total of 12 dwelling units above. That’s proposed-unit language on an issued permit. It is not twelve occupied homes. Address, owner, and contractor are not on this screen.”

**2:00–2:25 — No runtime AI on this build**

Do not wait for a spinner. Open **Extract** only if you need to show it is empty.

“Cursor helped me write the software. It is not running against these permits. There is no runtime model key and no saved model answer. What you see is the snapshot plus whatever I type.”

**2:25–3:20 — Human review**

Set Housing to housing-related. Scope to new building. Count type: proposed total. Count: 12. Quote: `TOTAL OF 12 DWELLING UNITS ABOVE`. Click **Save**.

“I’m saving a local review because that exact sentence is on the left. This is not a City determination. If the text were blank or ‘no work,’ I would use Insufficient evidence instead of inventing a number.”

**3:20–4:10 — Briefing**

Click **Briefing**.

“This is the note you’d actually send. Print or CSV. Only reviews I saved show up as findings. Unreviewed IDs stay out. There is no citywide homes-built total. Next step for a real analyst is OneStopPGH or PLI, not this prototype.”

**4:10–4:40 — Close**

Optional: click Docs → Limitations for two seconds.

“If this continued, I would finish independent labels on the small corpus, then maybe turn on a paid extraction key with a spend cap. Nobody at the City has agreed to a pilot.”

Stop before 5:00.

---

Skip anything that is not on screen. Do not fake a model response.
