# Limitations

- A permit record is not a housing unit. This product has **no aggregate housing-unit total**.
- An issued permit is not evidence that construction started, finished, passed inspection, or became occupied.
- Source `status` is a current label, not a historical timeline. A source value of Completed is not proof of occupied housing.
- This source alone cannot support a proposed → issued → completed funnel.
- HomeSignal is not the City Affordable Housing Development Project Explorer and is not the housing-development dashboard recommended in the City Controller’s June 2025 special report. Those tools (and that recommendation) already exist; this product is permit-description review.
- HomeSignal does not ingest Pittsburgh zoning layers or the zoning code and does not score zoning feasibility. Official pages say district/use rules vary by location and project scope, and most building permits require zoning approval (ROZA). Code, map, and zoning URLs on Sources are **future verification links only**.
- Unit numbers in descriptions may refer to existing units, proposed totals, additions, removals, or unrelated work. Those roles are kept separate.
- Story counts, bedroom counts, and valuations are not unit counts.
- Residential and commercial are administrative classes. Pittsburgh commercial records can include housing.
- Permit ID uniqueness in this snapshot does not mean one permit per development.
- Candidate keyword selection is a discovery aid. It can miss housing language and can include false positives. Excluded records are not proven to contain no housing.
- Missing, unknown, unsupported, not applicable, and zero are different states.
- This snapshot is not a representative sample of every Pittsburgh development project and is not proof of complete source coverage.
- Catalog HTML preview counts (49,255) disagreed with the downloaded dump (65,378). The dump is used; completeness of every month in 2025 was not independently audited against City systems.
- 2,417 of 4,243 cohort records have blank work descriptions.
- Parcel numbers are not stored in the public snapshot, runtime types, prompts, or exports.
- On 2026-09-26 ingest, 21 descriptions had house-number street patterns replaced with `[REDACTED_ADDRESS]`. Zero records were excluded for residual personal data after that scan. Automated redaction is still incomplete.
- Cost burden, affordability restrictions, displacement, actual migration, infrastructure capacity, and housing availability cannot be inferred from permit text.
- No causal claim that permitting changed rents; no neighborhood appreciation forecast; no landlord or resident scoring.
- Automated redaction of free text is incomplete. Builder inspection of the review corpus is still required before sending text to an external model or publishing screenshots.
- Local reviews persist in browser storage for this snapshot version only. They do not change City data or other users’ views.
- Live vendor extraction is unavailable until a separate runtime API key is configured. Hackathon mode instead uses a **simulated local provider** for record briefs and labeled demo extraction. Those outputs demonstrate the intended production workflow; they are not live vendor results and are not mixed into citywide permit metrics. Cursor is not called at runtime. Before the build window, AI consultation supported public-source research and early sketches; during the build window Cursor and Codex assisted software development, documentation, and demo preparation.
- Decision support only. Verify project details and completion with the responsible public authority.

## Who benefits and who could be harmed

Planners, advocates, and reporters can inspect evidence before making claims. Residents could be harmed by neighborhood stigma, misdirected investment, or automated enforcement based on missing or misread records. Keyword discovery can miss real housing or flag unrelated work. Quote matching proves text provenance, not correct interpretation. Human review and authority follow-up remain required.

Zillow metro asking-rent context and Census city survey context are different measures over different periods. The QuickFacts extract lacks margins of error. No household-flow, displacement, neighborhood affordability, or causal conclusions are supported. See SOURCES.md for reconciliation.
