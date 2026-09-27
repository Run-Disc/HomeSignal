"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  shouldCallExtractionApi,
} from "@/lib/extractUi";
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
}) {
  const { record, aiMode } = props;
  const [reviews, setReviews] = useState(loadReviews);
  const [proposal, setProposal] = useState<ExtractionProposal | null>(null);
  const [message, setMessage] = useState<string | null>(
    aiMode === "source-review" ? SOURCE_REVIEW_STATUS : null,
  );
  const [waiting, setWaiting] = useState(false);
  const [selectedField] = useState<string | null>(null);
  const [draft, setDraft] = useState<ReviewedFields>(emptyFields);
  const [reason, setReason] = useState("");
  const [quote, setQuote] = useState("");
  const [countKey, setCountKey] = useState<CountField>("proposedTotalUnitCount");
  const [countValue, setCountValue] = useState("");
  const [fieldError, setFieldError] = useState<{ field: "quote" | "countVal"; error: string } | null>(null);
  const requestGen = useRef(0);

  const current = reviews[record.recordId];
  const stale = Boolean(current && current.sanitizedInputHash !== record.inputHash);
  const blank = record.qualityFlags.includes("blank_description") || !record.workDescriptionSanitized;

  useEffect(() => {
    setProposal(loadCachedProposal(record.recordId, record.inputHash));
    setMessage(aiMode === "source-review" ? SOURCE_REVIEW_STATUS : null);
    setWaiting(false);
    setDraft(emptyFields());
    setReason("");
    setQuote("");
    setCountValue("");
    setFieldError(null);
    const existing = loadReviews()[record.recordId];
    if (existing?.finalFields) setDraft(existing.finalFields);
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
    setMessage("Waiting for a model response. You can still review the source text on the left.");
    try {
      const cached = loadCachedProposal(record.recordId, record.inputHash);
      if (cached) {
        if (requestGen.current !== gen) return;
        setProposal(cached);
        setMessage(
          cached.originLabel === "previously_generated"
            ? `Previously generated ${cached.generatedAt} · ${cached.modelId}`
            : `Using cached response from ${cached.generatedAt}`,
        );
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
        setMessage(
          data.proposal.originLabel === "previously_generated"
            ? `Previously generated ${data.proposal.generatedAt} · ${data.proposal.modelId}`
            : `Live extraction ${data.proposal.generatedAt} · ${data.proposal.modelId}`,
        );
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
  }, [record.workDescriptionSanitized, proposal, selectedField]);

  function persist(decision: ReviewDecision) {
    const next = { ...loadReviews(), [record.recordId]: decision };
    saveReviews(next);
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
      origin: "ai_assisted_review",
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
      origin: proposal ? "ai_assisted_review" : "manual_source_review",
      proposalVersion: proposal ? `${proposal.modelId}:${proposal.generatedAt}` : null,
      state: "corrected",
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
      origin: "ai_assisted_review",
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
      origin: proposal ? "ai_assisted_review" : "manual_source_review",
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
    setMessage("Local review cleared for this record.");
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
        <section className="card" aria-labelledby="source-heading">
          <h2 id="source-heading">{record.sourcePermitId}</h2>
          <p className="metric-def">
            {record.neighborhood} · {record.issueDate} · {record.sourceClassRaw ?? "—"} ·{" "}
            {record.workTypeRaw ?? "—"} · {record.sourceStatusRaw ?? "—"}
          </p>
          <p className="source-text">{highlight || "No description"}</p>
        </section>
        <section className="card" aria-labelledby="review-heading">
          <h2 id="review-heading">Review</h2>
          {blank ? (
            <p className="banner">
              Description is blank. Use Insufficient evidence instead of a count.
            </p>
          ) : null}

          <p>
            Status:{" "}
            <strong>{current?.state.replaceAll("_", " ") ?? "unreviewed"}</strong>
            {current ? ` · ${current.timestamp}` : null}
          </p>
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
          <select id="countField" value={countKey} onChange={(e) => setCountKey(e.target.value as CountField)}>
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
          <div className="nav-row">
            {proposal ? (
              <button type="button" className="btn" onClick={accept}>
                Accept supported fields
              </button>
            ) : null}
            <button type="button" className="btn" onClick={saveSourceReview}>
              Save
            </button>
            <Link className="btn-secondary" href={`/export?example=${encodeURIComponent(record.recordId)}`}>
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
                <Link className="btn-secondary" href={`/review/${encodeURIComponent(props.neighbors.prev)}`}>
                  Previous
                </Link>
              ) : null}
              {props.neighbors.next ? (
                <Link className="btn-secondary" href={`/review/${encodeURIComponent(props.neighbors.next)}`}>
                  Next
                </Link>
              ) : null}
            </p>
          ) : null}
          <details className="defs">
            <summary>Extract</summary>
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
            {message ? <p className="metric-def">{message}</p> : null}
            {proposal ? <p className="metric-def">{proposal.explanation}</p> : null}
          </details>
        </section>
      </div>
    </div>
  );
}
