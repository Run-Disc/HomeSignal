# Submission worksheet

The live form is the authority for field names: https://docs.google.com/forms/d/e/1FAIpQLSfDK_aD-miOV3D92Bl4NOFa1Skb8_u-GTCH5j1FE-VEWTr4DQ/viewform

Cursor must not submit this form or make eligibility attestations.

| Item | Prepared value / placeholder |
|---|---|
| Team | [your team name]; solo is allowed |
| Members | [your legal name, contact, affiliation] |
| Track | Housing Production, Rents & Household Flow Observatory |
| Title | HomeSignal: Permit Evidence Observatory |
| Description | HomeSignal helps a municipal or nonprofit housing analyst inspect Pittsburgh PLI issued-permit descriptions, distinguish record counts from unit mentions, review AI or manual housing-scope evidence with exact quotes, and export a cited briefing. Snapshot: 2025 Building/BDA records retrieved 2026-09-26 from WPRDC. |
| What works | Overview filters and record metrics; candidate table; record workspace; manual review persistence; briefing print/CSV; sources and limitations. Live AI extraction is implemented but not demonstrated without a runtime key. |
| Next steps | Unconfirmed analyst pilot on a bounded set; builder-completed labels; optional live extraction with spending limits; only then consider project linkage with a data steward. |
| Repository | [public URL after you publish] |
| Demo video | [public 3–5 minute recording made this weekend] |
| Hosted app | [optional; not verified in this build] |
| Sources | See SOURCES.md |
| AI disclosure | See AI_DISCLOSURE.md |
| Limitations | See LIMITATIONS.md |
| Attestation | You personally complete age/participation/original-build statements |

## Builder actions still required

1. Inspect `data/evaluation/labeling-sheet.json` and the review corpus before any external model call.
2. Personally review WPRDC terms if a browser agreement appears.
3. Add a runtime extraction key only if you choose live AI, via `.env.local`, never in git.
4. Create a public repository and keep history intact.
5. Record and upload the demo.
6. Submit the form yourself before Sunday 2026-09-27 23:59 ET.
