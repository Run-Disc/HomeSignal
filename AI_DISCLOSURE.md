# AI disclosure

## Implementation assistance

Cursor (Grok 4.6) assisted implementation during the authorized build window beginning 2026-09-26 09:00 America/New_York. Pre-event research and planning documents in the parent `outputs/` folder were also AI-assisted and are not a prebuilt application.

The human builder remains responsible for scope choices, source-terms review, inspection of the review corpus, testing, claims, eligibility attestations, and event-form submission.

## Runtime model

The app includes a server-side extraction route (`POST /api/extract`) that can call an OpenAI-compatible Chat Completions JSON endpoint when `EXTRACTION_API_KEY` and `EXTRACTION_MODEL` are set in server environment variables.

As of this document, **no runtime key is configured in the repository**, and **`data/public/saved-extractions.json` is an empty list**. Therefore:

- The working demo path is source review + local human decisions + deterministic metrics/export.
- The UI must not label a missing live call as AI analysis.
- If a live call later succeeds, genuine responses may be saved with original timestamp, model id, record id, and input hash, and replayed as “Previously generated.”

Cursor coding credits are not a runtime API key for visitors.

## What the model is allowed to do (when configured)

Per-record structured extraction of housing relevance, work-scope labels (project categories), and explicit unit-count roles with exact supporting quotes. It may not invent numbers, retrieve URLs, or treat source text as instructions.

## Human role

Manual source review works without any model response. Reviews are labeled “Your local review” in the browser, or “Prototype review by project builder” if that role is recorded. Prototype review is not a City determination.
