# Submission worksheet

The live form is the authority for field names: https://docs.google.com/forms/d/e/1FAIpQLSfDK_aD-miOV3D92Bl4NOFa1Skb8_u-GTCH5j1FE-VEWTr4DQ/viewform

Cursor must not submit this form or make eligibility attestations.

| Item | Prepared value |
|---|---|
| Team | [your team name]; solo is allowed |
| Members | [your legal name, contact, affiliation] |
| Track | Housing Production, Rents & Household Flow Observatory |
| Title | HomeSignal: Permit Evidence Observatory |
| Description | HomeSignal helps a municipal or nonprofit housing analyst inspect Pittsburgh PLI issued-permit descriptions, distinguish record counts from unit mentions, review housing-scope evidence with exact quotes, and export a cited briefing. Snapshot: 2025 Building/BDA records retrieved 2026-09-26 from WPRDC. Live AI is optional and is not demonstrated without a separate runtime key. |
| What works | Overview filters and record metrics; candidate table; record workspace; keyless source-review path that does not fake a live extraction; local review persistence; briefing print/CSV; sources, limitations, evaluation pages. |
| Next steps | Unconfirmed analyst pilot on a bounded set; builder-completed labels; optional live extraction with spending limits; only then consider project linkage with a data steward. |
| Repository | https://github.com/Run-Disc/HomeSignal |
| Demo video | [public 3–5 minute recording made this weekend] |
| Hosted app | Optional. `vercel.json` is present. No deployment is claimed until you import the repo and verify the URL yourself. |
| Sources | See SOURCES.md |
| AI disclosure | See AI_DISCLOSURE.md |
| Limitations | See LIMITATIONS.md |
| Attestation | You personally complete age/participation/original-build statements |

## Judging-aligned notes (do not overclaim)

- **Usefulness:** record-level evidence for analysts; explicit unit-mention vs record-count split.
- **Data honesty:** dump vs catalog preview discrepancy is documented; blank descriptions counted.
- **AI role:** optional extraction with quote validation; working demo is human review.
- **Safeguards:** privacy scan, no parcel/owner/address in public artifacts, no citywide homes-built total.
- **Limits:** no occupancy, no funnel, unlabeled evaluation sheet.

## Builder actions still required

1. Inspect `data/evaluation/labeling-sheet.json` and the review corpus before any external model call.
2. Personally review WPRDC terms if a browser agreement appears.
3. Add a runtime extraction key only if you choose live AI, via `.env.local` or host env, never in git.
4. Record and upload the demo.
5. If you want a hosted URL, import https://github.com/Run-Disc/HomeSignal into Vercel (or equivalent) yourself and paste the URL you verified.
6. Submit the form yourself before Sunday 2026-09-27 23:59 ET.
