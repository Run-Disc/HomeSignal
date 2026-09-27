# HomeSignal agent boundaries

HomeSignal is a Track 2 permit-evidence observatory for the AI for Housing Hackathon. Follow this repository's documentation.

## Permanent rules

- A permit record is not a housing unit. An issued permit is not construction start, completion, or occupancy.
- Do not invent source records, metrics, citations, model results, or completed functionality.
- Never sum unit mentions into citywide homes-built totals.
- Keep owner names, contractor names, street addresses, and contact details out of the public snapshot, UI, prompts, logs, and exports.
- Manual source review must never be attributed to AI.
- Cursor is for software-development assistance only. Do not present Cursor, Grok, or other coding models as runtime analysis.
- Saved model responses must be genuine, source-bound, and labeled with original timestamp and model id. If no live call has succeeded, say so. Synthetic fixtures must stay labeled and out of factual metrics.
- Do not submit the event form or make eligibility attestations.
- Keep Git history honest. Do not rewrite timestamps.

## Scope

Must-ship: sanitized PLI snapshot, overview → review → export, deterministic record metrics, AI extraction with validation when a key exists, human review, sources/limitations/evaluation docs.

Deferred: maps, extra years, ACS context, accounts, notifications, project-level unit totals.
