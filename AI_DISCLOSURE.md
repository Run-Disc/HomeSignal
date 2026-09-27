# AI disclosure

## Software-development assistance

Before the build window, the public challenge brief, participant packet, and listed data sources were researched and planning materials were prepared. Planning included consulting AI. They contained no application code or reusable product. The first repository commit is timestamped 2026-09-26 09:58:27 America/New_York, after the authorized build window opened at 09:00.

During the build window, Cursor was used **only** for software-development assistance: coding, debugging, testing, and documentation editing.

Cursor is **not** a runtime model in HomeSignal. Grok is **not** a runtime model in HomeSignal. No Cursor, Grok, or other assistant is called while a visitor uses the queue, record, or briefing screens.

The human builder remains responsible for scope, source-terms review, corpus inspection, claims, eligibility attestations, and event-form submission.

## Runtime

Displayed findings in the working demo are:

- **Deterministic** counts and filters from the sanitized PLI snapshot, or
- **Human-entered** local reviews stored in this browser.

HomeSignal includes `POST /api/extract`, which can call an OpenAI-compatible Chat Completions JSON endpoint **only when** `EXTRACTION_API_KEY` and `EXTRACTION_MODEL` are set in server environment variables.

As of this document:

- **No runtime key is configured** in the repository.
- **`data/public/saved-extractions.json` is `[]`.**
- There is **no genuine saved model output** to display.
- Cursor coding credits are not a runtime API key.

If a live call later succeeds, genuine responses may be saved with original timestamp, model id, record id, and input hash, and replayed as “Previously generated.” Fabricated or synthetic fixture text must never be shown as a live model result or mixed into factual metrics.

A keyword/work-type discovery aid can explain why a record entered the housing queue. It is not model output.

## What extraction may do (when a key exists)

Per-record structured extraction of housing relevance, work-scope labels, and explicit unit-count roles with exact supporting quotes. It may not invent numbers, retrieve URLs, or treat source text as instructions.

## Human role

Manual source review works without any model response. Reviews are labeled as local reviewer, not City determinations.
