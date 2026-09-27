# Compliance audit (documentation)

Date of this matrix: 2026-09-27. Scope: public repository https://github.com/Run-Disc/HomeSignal at the commit that includes this file. The repository was checked against the 14-page participant packet, event website, Track 2 challenge brief, WPRDC catalog, comparable City tools, and live Google submission form. This file does **not** submit that form or attest eligibility.

Statuses:

- **Verified** — evidence exists in this repository or on the public GitHub remote as described.
- **Prepared** — draft copy exists for a human to paste or complete; the live artifact is still missing.
- **Builder action required** — not present; Cursor must not invent it.

| Requirement | Status | Evidence / gap |
|---|---|---|
| Public repository | Verified | Remote `origin` is https://github.com/Run-Disc/HomeSignal (`main` pushed). |
| Kickoff-era intact commit history | Verified | First commit `adf762f` dated **2026-09-26 09:58:27 -0400**, after Saturday 09:00 ET kickoff. Later commits `3d86fdc` (10:05:06) and `b0c3c81` (10:30:20) are also in-window. History was not rewritten in this project. |
| No secrets in git | Verified | `.gitignore` excludes `.env`, `.env.local`, `.env*.local`. `.env.example` lists variable **names** only. Committed tree grep found no `EXTRACTION_API_KEY=` values or private-key armor. |
| One project / one track | Verified | Track 2 only: Housing Production, Rents & Household Flow Observatory. No second track app in this repo. |
| Working prototype | Verified | Next.js app: overview → review → export; sanitized snapshot committed; local tests and production build succeeded on 2026-09-26 (see `BUILD_STATUS.md`). |
| 3–5 minute public demo video | Builder action required | The private recording narration is intentionally kept outside the public repository. **No video file or public video URL exists in this repository.** |
| Documentation | Verified | README, SOURCES, DATA_DICTIONARY, LIMITATIONS, AI_DISCLOSURE, EVALUATION, FINAL_ACTIONS, SUBMISSION_CHECKLIST, WINDOWS_INSTALL, MAC_INSTALL, this audit. |
| Exact data citations | Verified | `SOURCES.md`: title, publisher, landing, resource URL, dump URL, resource id `f4d1177a-f597-4c32-8cbf-7885f56253f6`, retrieval 2026-09-26, license CC-BY, dump vs catalog preview counts. |
| Limitations | Verified | `LIMITATIONS.md` and `/limitations`. Includes permit ≠ unit, issued ≠ complete/occupied, no funnel, blank descriptions, no accuracy %. |
| Decision-support framing | Verified | UI and docs: prototype review is not a City determination; verify with the responsible authority. |
| PII / privacy | Verified | Public snapshot omits owner, contractor, address, parcel ids, coordinates, contacts. Ingest privacy scan documented in `BUILD_STATUS.md` (21 address-token replacements; 0 residual exclusions). Automated redaction still incomplete. |
| Human-in-the-loop | Verified | Manual review without a model; accept requires a proposal; localStorage reviews; extraction allowlist when a key exists. |
| AI disclosure | Verified | `AI_DISCLOSURE.md`: pre-event AI consultation supported public-source research and early sketches, with no application code; during the build window Cursor (including Grok) and Codex assisted coding, debugging, testing, documentation, and demo preparation. No Cursor/Grok/other model runs in this submission; **no key and empty `saved-extractions.json`**. |
| Team name | Builder action required | Placeholder only in `SUBMISSION_CHECKLIST.md`. Not invented here. |
| Member #1 name / email / affiliation | Builder action required | Placeholders only. Not invented here. |
| Over-18 / eligibility attestation | Builder action required | Live form attestation must be completed by the human submitter. Cursor must not attest. |
| Event-form submission | Builder action required | Form not submitted by Cursor. Deadline stated by the event: Sunday 2026-09-27 23:59 ET (confirm on the live form). |
| Hosted deployment URL | Builder action required | `vercel.json` is configuration only. **No deployment was performed or verified.** |
| Saved genuine model outputs | Verified as absent | `data/public/saved-extractions.json` is `[]`. Do not claim live AI succeeded. |

Commit timestamps establish the recorded repository history, not independent proof that no code existed elsewhere before kickoff. The builder must personally make the no-prior-code and eligibility attestations. No score or prize is guaranteed.

## Live Google form fields (as reviewed)

The live form is the authority: https://docs.google.com/forms/d/e/1FAIpQLSfDK_aD-miOV3D92Bl4NOFa1Skb8_u-GTCH5j1FE-VEWTr4DQ/viewform

Fields currently required on that form, mapped to this repo:

| Live form field | Status | What to paste / do |
|---|---|---|
| Team Name | Builder action required | Human-chosen name (solo allowed). |
| Member #1 name | Builder action required | Legal name. |
| Member #1 email | Builder action required | Contact email. |
| Member #1 affiliation | Builder action required | Affiliation as the form requests. |
| Track | Prepared | Housing Production, Rents & Household Flow Observatory |
| Project title | Prepared | HomeSignal: Permit Evidence Observatory |
| Project description (including what is next) | Prepared | Draft in `SUBMISSION_CHECKLIST.md`. Includes working path and next steps. Confirm the live box still asks for “what is next.” |
| Demo Video link | Builder action required | Record and publish the private 3–5 minute walkthrough prepared outside this repository. |
| Public repository link | Prepared | https://github.com/Run-Disc/HomeSignal |
| Data sources | Prepared | `SOURCES.md` (PLI dump plus related City tools and unused zoning links). |
| AI disclosure | Prepared | `AI_DISCLOSURE.md`. |
| Over-18 attestation | Builder action required | Human only. |

If the live form shows additional optional fields (hosted app URL, extra members), leave them blank or fill only what you have verified.
