"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RecordAiPanel } from "@/components/RecordAiPanel";
import {
  loadCachedProposal,
  loadFailedIds,
  loadReviews,
  saveCachedProposal,
  saveFailedIds,
  saveReviews,
} from "@/lib/clientStore";
import { COUNT_LABELS, SCOPE_LABELS } from "@/lib/constants";
import { reviewerLabel } from "@/lib/briefing";
import {
  SOURCE_REVIEW_STATUS,
  countsAsFailedLiveExtraction,
  extractionButtonLabel,
  proposalStatusLabel,
  reviewOriginFromProposal,
  reviewStatusChip,
  shouldCallExtractionApi,
} from "@/lib/extractUi";
import type { EvidenceRef } from "@/lib/ai/schema";
import { applyCountCorrection } from "@/lib/reviewLogic";
import type { AiMode, ClientPermit } from "@/lib/types";
import type {
  CountField,
  ExtractionProposal,
  HousingRelevance,
  ProposedScope,
  ReviewDecision,
  ReviewedFields,
} from "@/lib/types";

const COUNT_KEYS: CountField[] = [
  "existingUnitCount",
  "proposedTotalUnitCount",
  "explicitAddedUnitCount",
  "explicitRemovedUnitCount",
];

const FIELD_LABELS: Record<EvidenceRef["field"], string> = {
  workDescriptionSanitized: "the public work description",
  workTypeRaw: "work type",
  permitTypeRaw: "permit type",
  sourceClassRaw: "source class",
  issueDate: "issue date",
  sourceStatusRaw: "source status",
};

function fieldsFromProposal(p: ExtractionProposal): ReviewedFields {
  return {
    housingRelevance: p.housingRelevance,
    proposedScope: p.proposedScope,
    existingUnitCount: p.existingUnitCount,
    proposedTotalUnitCount: p.proposedTotalUnitCount,
    explicitAddedUnitCount: p.explicitAddedUnitCount,
    explicitRemovedUnitCount: p.explicitRemovedUnitCount,
    countEvidence: p.countEvidence,
    unsourcedNotes: [],
  };
}

function emptyFields(): ReviewedFields {
  return {
    housingRelevance: "uncertain",
    proposedScope: "uncertain",
    existingUnitCount: null,
    proposedTotalUnitCount: null,
    explicitAddedUnitCount: null,
    explicitRemovedUnitCount: null,
    countEvidence: {},
    unsourcedNotes: [],
  };
}

export function ReviewWorkspace(props: {
  record: ClientPermit;
  neighbors: { prev: string | null; next: string | null };
  modeDescription: string;
  aiMode: AiMode;
  contextQuery: string;
  briefingQuery: string;
}) {
  const { record, aiMode } = props;
  const [reviews, setReviews] = useState<ReturnType<typeof loadReviews>>({});
  const [proposal, setProposal] = useState<ExtractionProposal | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [waiting, setWaiting] = useState(false);
  const [selectedField] = useState<string | null>(null);
  const [draft, setDraft] = useState<ReviewedFields>(emptyFields);
  const [reason, setReason] = useState("");
  const [quote, setQuote] = useState("");
  const [countKey, setCountKey] = useState<CountField>("proposedTotalUnitCount");
  const [countValue, setCountValue] = useState("");
  const [fieldError, setFieldError] = useState<{ field: "quote" | "countVal"; error: string } | null>(null);
  const [cited, setCited] = useState<EvidenceRef | null>(null);
  const requestGen = useRef(0);
  const sourceTextRef = useRef<HTMLParagraphElement>(null);
  const sourceCardRef = useRef<HTMLElement>(null);

  const current = reviews[record.recordId];
  const chip = reviewStatusChip(current?.state, Boolean(proposal));

  const showSource = useCallback((ev: EvidenceRef) => {
    setCited({ ...ev });
  }, []);

  useEffect(() => {
    if (!cited) return;
    const card = sourceCardRef.current;
    const target = card?.querySelector("mark.cited") ?? card;
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
    card?.focus({ preventScroll: true });
  }, [cited]);
  const stale = Boolean(current && current.sanitizedInputHash !== record.inputHash);
  const blank = record.qualityFlags.includes("blank_description") || !record.workDescriptionSanitized;

  useEffect(() => {
    setReviews(loadReviews());
    const cached = loadCachedProposal(record.recordId, record.inputHash);
    const usableCache =
      aiMode === "source-review"
        ? cached?.originLabel === "synthetic_demo"
          ? cached
          : null
        : cached;
    setProposal(usableCache);
    setMessage(null);
    setWaiting(false);
    setCited(null);
    setDraft(emptyFields());
    setReason("");
    setQuote("");
    setCountValue("");
    setFieldError(null);
    setCountKey("proposedTotalUnitCount");
    const existing = loadReviews()[record.recordId];
    if (existing?.finalFields && existing.sanitizedInputHash === record.inputHash) {
      setDraft(existing.finalFields);
      setCountValue(existing.finalFields.proposedTotalUnitCount?.toString() ?? "");
      setQuote(existing.finalFields.countEvidence.proposedTotalUnitCount?.quote ?? "");
      setReason(existing.reason);
    } else if (usableCache) {
      setDraft(fieldsFromProposal(usableCache));
      setCountValue(usableCache.proposedTotalUnitCount?.toString() ?? "");
      setQuote(usableCache.countEvidence.proposedTotalUnitCount?.quote ?? "");
    }
  }, [record.recordId, record.inputHash, aiMode]);

  const requestExtract = useCallback(async () => {
    if (!shouldCallExtractionApi(aiMode)) {
      setWaiting(false);
      setMessage(SOURCE_REVIEW_STATUS);
      return;
    }
    const gen = requestGen.current + 1;
    requestGen.current = gen;
    setWaiting(true);
    setMessage(
      aiMode === "source-review"
        ? "Preparing simulated extraction…"
        : "Waiting for a model response…",
    );
    try {
      const cached = loadCachedProposal(record.recordId, record.inputHash);
      const usableCache =
        aiMode === "source-review"
          ? cached?.originLabel === "synthetic_demo"
            ? cached
            : null
          : cached;
      if (usableCache) {
        if (requestGen.current !== gen) return;
        setProposal(usableCache);
        setDraft(fieldsFromProposal(usableCache));
        setCountKey("proposedTotalUnitCount");
        setCountValue(usableCache.proposedTotalUnitCount?.toString() ?? "");
        setQuote(usableCache.countEvidence.proposedTotalUnitCount?.quote ?? "");
        setMessage(null);
        return;
      }
      const controller = new AbortController();
      const timer = window.setTimeout(() => controller.abort(), 15000);
      let res: Response;
      try {
        res = await fetch("/api/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recordId: record.recordId }),
          signal: controller.signal,
        });
      } finally {
        window.clearTimeout(timer);
      }
      const data = (await res.json()) as {
        status: string;
        proposal?: ExtractionProposal;
        message?: string;
      };
      if (requestGen.current !== gen) return;
      if (data.status === "ok" && data.proposal) {
        if (data.proposal.targetRecordId !== record.recordId) return;
        setProposal(data.proposal);
        saveCachedProposal(data.proposal);
        setDraft(fieldsFromProposal(data.proposal));
        setCountKey("proposedTotalUnitCount");
        setCountValue(data.proposal.proposedTotalUnitCount?.toString() ?? "");
        setQuote(data.proposal.countEvidence.proposedTotalUnitCount?.quote ?? "");
        setMessage(null);
      } else {
        if (countsAsFailedLiveExtraction(aiMode, data.status)) {
          const ids = new Set(loadFailedIds());
          ids.add(record.recordId);
          saveFailedIds([...ids]);
        }
        setMessage(data.message || "AI extraction unavailable; source review still works.");
      }
    } catch (error) {
      const aborted = error instanceof DOMException && error.name === "AbortError";
      setMessage(
        aborted
          ? "The extraction request timed out after 15 seconds. Source review still works."
          : "AI extraction unavailable; source review still works.",
      );
    } finally {
      if (requestGen.current === gen) setWaiting(false);
    }
  }, [record.recordId, record.inputHash, aiMode]);

  const highlight = useMemo(() => {
    const text = record.workDescriptionSanitized || "";
    if (cited?.field === "workDescriptionSanitized") {
      const at = text.indexOf(cited.quote);
      if (at >= 0) {
        return [
          text.slice(0, at),
          <mark className="evidence cited" key="cited">
            {text.slice(at, at + cited.quote.length)}
          </mark>,
          text.slice(at + cited.quote.length),
        ];
      }
    }
    const spans: Array<{ start: number; end: number; label: string }> = [];
    if (proposal) {
      for (const key of COUNT_KEYS) {
        const ev = proposal.countEvidence[key];
        if (ev?.field === "workDescriptionSanitized") {
          spans.push({ start: ev.start, end: ev.end, label: key });
        }
      }
      const rel = proposal.classificationEvidence.housingRelevance;
      const scope = proposal.classificationEvidence.proposedScope;
      if (rel?.field === "workDescriptionSanitized") spans.push({ start: rel.start, end: rel.end, label: "relevance" });
      if (scope?.field === "workDescriptionSanitized") spans.push({ start: scope.start, end: scope.end, label: "scope" });
    }
    const wanted = selectedField ? spans.filter((s) => s.label === selectedField) : spans;
    if (wanted.length === 0) return text;
    wanted.sort((a, b) => a.start - b.start);
    const parts: React.ReactNode[] = [];
    let cursor = 0;
    wanted.forEach((span, i) => {
      if (span.start < cursor) return;
      parts.push(text.slice(cursor, span.start));
      parts.push(
        <mark className="evidence" key={`${span.start}-${i}`}>
          {text.slice(span.start, span.end)}
        </mark>,
      );
      cursor = span.end;
    });
    parts.push(text.slice(cursor));
    return parts;
  }, [record.workDescriptionSanitized, proposal, selectedField, cited]);

  function meta(field: EvidenceRef["field"], value: string | null) {
    if (!value) return "—";
    return cited?.field === field && cited.quote === value ? <mark className="evidence cited">{value}</mark> : value;
  }

  function persist(decision: ReviewDecision) {
    const next = { ...loadReviews(), [record.recordId]: decision };
    try {
      saveReviews(next);
    } catch {
      setMessage("Review was not saved. Browser storage is unavailable or full. Enable local storage before saving again.");
      return;
    }
    setReviews(next);
    setFieldError(null);
    setMessage(`Saved as ${decision.state.replaceAll("_", " ")}. ${reviewerLabel(decision.reviewerRole)}.`);
  }

  function accept() {
    if (!proposal) {
      setMessage("There is no AI proposal to accept. Use Record human source review instead.");
      return;
    }
    persist({
      recordId: record.recordId,
      snapshotVersion: record.snapshotVersion,
      sanitizedInputHash: record.inputHash,
      origin: reviewOriginFromProposal(proposal),
      proposalVersion: `${proposal.modelId}:${proposal.generatedAt}`,
      state: "accepted",
      reviewerRole: "local_reviewer",
      timestamp: new Date().toISOString(),
      finalFields: fieldsFromProposal(proposal),
      reason: reason || "Accepted supported fields from the proposal after inspecting source text.",
    });
  }

  function saveSourceReview() {
    const result = applyCountCorrection({
      draft,
      countKey,
      countValue,
      quote,
      sourceText: record.workDescriptionSanitized || "",
      reason,
    });
    if (!result.ok) {
      setFieldError({ field: result.field, error: result.error });
      return;
    }
    persist({
      recordId: record.recordId,
      snapshotVersion: record.snapshotVersion,
      sanitizedInputHash: record.inputHash,
      origin: reviewOriginFromProposal(proposal),
      proposalVersion: proposal ? `${proposal.modelId}:${proposal.generatedAt}` : null,
      state: proposal ? "corrected" : "source_reviewed",
      reviewerRole: "local_reviewer",
      timestamp: new Date().toISOString(),
      finalFields: result.fields,
      reason: reason || "Recorded after inspecting the sanitized source text.",
    });
    setDraft(result.fields);
  }

  function reject() {
    if (!proposal) {
      setMessage("There is no AI proposal to reject. Use Insufficient evidence or save a source review.");
      return;
    }
    persist({
      recordId: record.recordId,
      snapshotVersion: record.snapshotVersion,
      sanitizedInputHash: record.inputHash,
      origin: reviewOriginFromProposal(proposal),
      proposalVersion: `${proposal.modelId}:${proposal.generatedAt}`,
      state: "rejected",
      reviewerRole: "local_reviewer",
      timestamp: new Date().toISOString(),
      finalFields: null,
      reason: reason || "Rejected proposal; excluded from reviewed findings.",
    });
  }

  function insufficient() {
    persist({
      recordId: record.recordId,
      snapshotVersion: record.snapshotVersion,
      sanitizedInputHash: record.inputHash,
      origin: reviewOriginFromProposal(proposal),
      proposalVersion: proposal ? `${proposal.modelId}:${proposal.generatedAt}` : null,
      state: "insufficient_evidence",
      reviewerRole: "local_reviewer",
      timestamp: new Date().toISOString(),
      finalFields: { ...emptyFields(), unsourcedNotes: draft.unsourcedNotes },
      reason: reason || "Leave counts unknown; verify on the official permit record.",
    });
  }

  function undo() {
    const next = { ...loadReviews() };
    delete next[record.recordId];
    saveReviews(next);
    setReviews(next);
    setDraft(emptyFields());
    setCountValue("");
    setQuote("");
    setReason("");
    setFieldError(null);
    setMessage("Local review cleared for this record.");
  }

  function selectCountField(key: CountField) {
    setCountKey(key);
    setCountValue(draft[key]?.toString() ?? "");
    setQuote(draft.countEvidence[key]?.quote ?? "");
    setFieldError(null);
  }

  function useSelectedSourceText() {
    const selection = window.getSelection();
    const source = sourceTextRef.current;
    const selected = selection?.toString().trim() ?? "";
    const startsInSource = source && selection?.anchorNode ? source.contains(selection.anchorNode) : false;
    const endsInSource = source && selection?.focusNode ? source.contains(selection.focusNode) : false;
    if (!selected || !startsInSource || !endsInSource) {
      setMessage("Select the exact supporting words in the public description, then choose Use selected text.");
      return;
    }
    setQuote(selected);
    if (fieldError?.field === "quote") setFieldError(null);
    setMessage("Exact source excerpt copied into the review form. Confirm the count and interpretation before saving.");
  }

  return (
    <div>
      {stale ? (
        <p className="banner error">
          This browser’s saved review was recorded against a different source-text hash. Re-read the description
          and save again before treating the old decision as current.
        </p>
      ) : null}
      <div className="workspace">
        <section className="card" aria-labelledby="source-heading" ref={sourceCardRef} tabIndex={-1}>
          <p className="layer-label">1 · Source</p>
          <h2 id="source-heading">{record.sourcePermitId}</h2>
          <p className="metric-def">
            {record.neighborhood} · {meta("issueDate", record.issueDate)} · {meta("sourceClassRaw", record.sourceClassRaw)} ·{" "}
            {meta("workTypeRaw", record.workTypeRaw)} · {meta("sourceStatusRaw", record.sourceStatusRaw)}
          </p>
          <p ref={sourceTextRef} className="source-text">{highlight || "No description"}</p>
          {cited ? (
            <p className="cited-note" role="status">
              Showing cited text: <q>{cited.quote}</q> in {FIELD_LABELS[cited.field]} ({cited.citationId}).{" "}
              <button type="button" className="link-btn" onClick={() => setCited(null)}>
                Clear highlight
              </button>
            </p>
          ) : null}
          {!blank ? (
            <div className="source-actions">
              <button type="button" className="btn-secondary" onClick={useSelectedSourceText}>
                Use selected text as quote
              </button>
            </div>
          ) : null}
        </section>
        <section className="card" aria-labelledby="review-heading">
          <h2 id="review-heading">Review</h2>
          <section className="extraction-panel" aria-labelledby="extract-heading">
            <p className="layer-label">2 · Review evidence</p>
            <h3 id="extract-heading">Structured review</h3>
            <p className="metric-def">
              {aiMode === "source-review"
                ? "Enter evidence from the source, or use the optional simulated extraction. No external model is called."
                : aiMode === "saved"
                  ? "Replays previously generated responses with their original timestamp."
                  : "Live model extraction for the review-corpus allowlist."}
            </p>
            <p>
              <button
                type="button"
                className="btn-secondary"
                disabled={waiting}
                onClick={() => void requestExtract()}
              >
                {extractionButtonLabel(aiMode, waiting)}
              </button>
            </p>
            {proposal ? (
              <>
                {proposal.proposedTotalUnitCount != null && proposal.countEvidence.proposedTotalUnitCount ? (
                  <p className="extracted-fact">
                    <span className="layer-label">Extracted fact</span>
                    <strong>{proposal.proposedTotalUnitCount}</strong> dwelling units are explicitly mentioned.
                    Quote: “{proposal.countEvidence.proposedTotalUnitCount.quote}”. Not homes built or occupied.
                  </p>
                ) : null}
                {proposal.originLabel !== "synthetic_demo" ? (
                  <p className="metric-def">{proposalStatusLabel(proposal)}</p>
                ) : null}
              </>
            ) : null}
            <details className="defs">
              <summary>About this extraction</summary>
              {proposal ? <p className="metric-def">{proposalStatusLabel(proposal)}</p> : null}
              {proposal ? <p className="metric-def">{proposal.explanation}</p> : null}
              <p className="metric-def">{props.modeDescription}</p>
              <p className="metric-def">
                Text matching checks that a quote exists in the source. You confirm what the number means. To quote
                manually, select words in the description and choose Use selected text as quote.
              </p>
            </details>
          </section>
          {blank ? (
            <p className="banner">
              Description is blank. Use Insufficient evidence instead of a count.
            </p>
          ) : null}

          <p>
            Status: <span className={`status-chip ${chip.tone}`}>{chip.label}</span>
            {current ? <span className="metric-def"> · saved {current.timestamp}</span> : null}
          </p>
          {message ? (
            <p className="review-message" role="status" aria-live="polite">
              {message}
            </p>
          ) : null}
          <label htmlFor="rel">Housing</label>
          <select
            id="rel"
            value={draft.housingRelevance}
            onChange={(e) => setDraft({ ...draft, housingRelevance: e.target.value as HousingRelevance })}
          >
            <option value="housing">Housing-related</option>
            <option value="not_housing">Not housing-related</option>
            <option value="uncertain">Uncertain</option>
          </select>
          <label htmlFor="scope">Scope</label>
          <select
            id="scope"
            value={draft.proposedScope}
            onChange={(e) => setDraft({ ...draft, proposedScope: e.target.value as ProposedScope })}
          >
            <option value="new_building">{SCOPE_LABELS.new_building}</option>
            <option value="conversion">{SCOPE_LABELS.conversion}</option>
            <option value="addition_or_alteration">{SCOPE_LABELS.addition_or_alteration}</option>
            <option value="demolition">{SCOPE_LABELS.demolition}</option>
            <option value="other">{SCOPE_LABELS.other}</option>
            <option value="uncertain">{SCOPE_LABELS.uncertain}</option>
          </select>
          <label htmlFor="countField">Count type</label>
          <select id="countField" value={countKey} onChange={(e) => selectCountField(e.target.value as CountField)}>
            {COUNT_KEYS.map((k) => (
              <option key={k} value={k}>
                {COUNT_LABELS[k]}
              </option>
            ))}
          </select>
          <label htmlFor="countVal">Count</label>
          <input
            id="countVal"
            value={countValue}
            onChange={(e) => {
              setCountValue(e.target.value);
              if (fieldError?.field === "countVal") setFieldError(null);
            }}
            inputMode="numeric"
            aria-invalid={fieldError?.field === "countVal"}
            aria-describedby={fieldError?.field === "countVal" ? "count-error" : undefined}
          />
          {fieldError?.field === "countVal" ? (
            <p id="count-error" className="field-error" role="alert">
              {fieldError.error}
            </p>
          ) : null}
          <label htmlFor="quote">Quote from description</label>
          <textarea
            id="quote"
            rows={3}
            value={quote}
            onChange={(e) => {
              setQuote(e.target.value);
              if (fieldError?.field === "quote") setFieldError(null);
            }}
            aria-invalid={fieldError?.field === "quote"}
            aria-describedby={fieldError?.field === "quote" ? "quote-error" : undefined}
          />
          {fieldError?.field === "quote" ? (
            <p id="quote-error" className="field-error" role="alert">
              {fieldError.error}
            </p>
          ) : null}
          <label htmlFor="reason">Notes</label>
          <textarea id="reason" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
          <div className="nav-row review-actions">
            {proposal ? (
              <button type="button" className="btn" onClick={accept}>
                Accept supported fields
              </button>
            ) : null}
            <button type="button" className="btn" onClick={saveSourceReview}>
              Save analyst review
            </button>
            <Link className="btn-secondary" href={`/export?${props.briefingQuery}`}>
              Briefing
            </Link>
            {proposal ? (
              <button type="button" className="btn-secondary" onClick={reject}>
                Reject proposal
              </button>
            ) : null}
            <button type="button" className="btn-secondary" onClick={insufficient}>
              Insufficient evidence
            </button>
            <button type="button" className="btn-secondary" onClick={undo}>
              Undo
            </button>
          </div>
          {props.neighbors.prev || props.neighbors.next ? (
            <p className="nav-row">
              {props.neighbors.prev ? (
                <Link className="btn-secondary" href={`/review/${encodeURIComponent(props.neighbors.prev)}?${props.contextQuery}`}>
                  Previous
                </Link>
              ) : null}
              {props.neighbors.next ? (
                <Link className="btn-secondary" href={`/review/${encodeURIComponent(props.neighbors.next)}?${props.contextQuery}`}>
                  Next
                </Link>
              ) : null}
            </p>
          ) : null}
        </section>
      </div>
      <RecordAiPanel
        record={record}
        review={current && !stale ? current : null}
        reviewLabel={stale ? "Saved review is stale — re-review required" : chip.label}
        onShowSource={showSource}
      />
    </div>
  );
}
