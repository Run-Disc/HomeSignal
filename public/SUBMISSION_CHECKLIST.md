# Submission checklist (live form fields)

The live form is the authority: https://docs.google.com/forms/d/e/1FAIpQLSfDK_aD-miOV3D92Bl4NOFa1Skb8_u-GTCH5j1FE-VEWTr4DQ/viewform

Cursor must not submit this form, invent identity, or make the over-18 / eligibility attestation.

Independently reviewed required fields and prepared values:

| Live form field | Prepared value | Who completes it |
|---|---|---|
| Team Name | *[your team name; solo is allowed]* | Builder |
| Member #1 name | *[your legal name]* | Builder |
| Member #1 email | *[your email]* | Builder |
| Member #1 affiliation | *[your affiliation as the form requests]* | Builder |
| Track | Housing Production, Rents & Household Flow Observatory | Prepared — confirm on the form |
| Project title | HomeSignal: Permit Evidence Observatory | Prepared |
| Project description, including what is next | HomeSignal helps a municipal or nonprofit housing analyst inspect Pittsburgh PLI issued-permit descriptions, distinguish record counts from unit mentions, complete a human source review, and export a cited briefing. Optional AI extraction is implemented but **not live** without a separate runtime key; the working demo is source-review plus a labeled keyword/work-type discovery aid. Snapshot: 2025 Building/BDA records retrieved 2026-09-26 from WPRDC resource `f4d1177a-f597-4c32-8cbf-7885f56253f6`. **Next:** builder-completed labels on the bounded corpus; optional live extraction with spending limits; unconfirmed analyst pilot; no agency agreement. Maps, extra years, ACS, and citywide homes-built totals stay out of scope until those exist. | Prepared — paste and edit in your voice |
| Demo Video link | *[public 3–5 minute recording URL — not in this repository]* | Builder |
| Public repository link | https://github.com/Run-Disc/HomeSignal | Prepared |
| Data sources | See `SOURCES.md`: City of Pittsburgh PLI Permits via WPRDC, CC-BY, dump https://data.wprdc.org/datastore/dump/f4d1177a-f597-4c32-8cbf-7885f56253f6 retrieved 2026-09-26. | Prepared |
| AI disclosure | See `AI_DISCLOSURE.md`: Cursor (Grok 4.6) implementation assistance; optional OpenAI-compatible Chat Completions route; no runtime key and no saved genuine model responses in the repo. | Prepared |
| Over-18 attestation | *[you personally check this on the live form]* | Builder — Cursor must not attest |

Optional if the form shows them: hosted app URL (`vercel.json` exists; **no deployment claimed**); additional members.

Timed narration for the video: `DEMO_SCRIPT.md`. Packet-style matrix: `COMPLIANCE_AUDIT.md`.

## Remaining human actions

1. Put your real team name, Member #1 name, email, and affiliation into the live form.
2. Record and publish a 3–5 minute demo using `DEMO_SCRIPT.md`; paste the public video URL.
3. Personally complete the over-18 / eligibility attestation on the live form.
4. Submit the form yourself before the event deadline (stated as Sunday 2026-09-27 23:59 ET; confirm on the form).
5. Inspect `data/evaluation/labeling-sheet.json` before any external model call.
6. Review WPRDC terms yourself if a browser agreement appears.
7. Optional: add a runtime extraction key only in `.env.local` or host env, never in git.
8. Optional: import this GitHub repo into Vercel (or equivalent) yourself and paste only a URL you opened.
