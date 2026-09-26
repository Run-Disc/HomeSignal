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
import { COUNT_LABELS, DECISION_SUPPORT, SCOPE_LABELS } from "@/lib/constants";
import { DISCOVERY_CAVEAT, explainDiscovery } from "@/lib/discovery";
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
  const [selectedField, setSelectedField] = useState<string | null>(null);
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
  const discovery = useMemo(() => explainDiscovery(record), [record]);
  const sourceReviewMode = aiMode === "source-review" && !proposal;

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
      <p className="page-kicker">Step 2 of 3 · Review</p>
      <p className="crumb">
        <Link href="/">Overview</Link>
        {" / "}
        <strong>{record.sourcePermitId}</strong>
        {" / "}
        <Link href={`/export?example=${encodeURIComponent(record.recordId)}`}>Export</Link>
      </p>
      <p className="banner">{props.modeDescription}</p>
      {stale ? (
        <p className="banner error">
          This browser’s saved review was recorded against a different source-text hash. Re-read the description
          and save again before treating the old decision as current.
        </p>
      ) : null}
      <div className="nav-row">
        <Link className="btn-secondary" href="/">
          Back to overview
        </Link>
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
        <Link className="btn" href={`/export?example=${encodeURIComponent(record.recordId)}`}>
          Export with this example
        </Link>
      </div>
      <div className="workspace">
        <section className="card" aria-labelledby="source-heading">
          <h2 id="source-heading">Sanitized source record</h2>
          <p>
            <strong>{record.sourcePermitId}</strong> · {record.issueDate} · {record.neighborhood}
          </p>
          <p>
            Source class: {record.sourceClassRaw ?? "Unknown"} (administrative, not a housing determination)
          </p>
          <p>Permit type: {record.permitTypeRaw ?? "Unknown"}</p>
          <p>Work type: {record.workTypeRaw ?? "Unknown"}</p>
          <p>
            Source status: {record.sourceStatusRaw ?? "Unknown"} — current status only, not a completion timeline.
          </p>
          <p>
            Citation: {record.citationId} · snapshot {record.snapshotVersion}
          </p>
          <h3>Work description</h3>
          <p className="source-text">{highlight || "(blank description)"}</p>
          <p className="metric-def">
            Street address, owner, and contractor fields were excluded. Automated redaction is incomplete.
          </p>
          <h3>Why this record is in the queue</h3>
          <p>{discovery.summary}</p>
          <p className="metric-def">{DISCOVERY_CAVEAT}</p>
        </section>
        <section className="card" aria-labelledby="review-heading">
          <h2 id="review-heading">Record human source review</h2>
          {sourceReviewMode ? (
            <p className="metric-def">
              No model proposal is loaded. Mark what the source supports. Do not invent a count if the text is
              blank or ambiguous.
            </p>
          ) : null}
          <p>
            <button
              type="button"
              className={aiMode === "source-review" ? "btn-secondary" : "btn"}
              disabled={waiting}
              aria-describedby="extract-status"
              onClick={() => void requestExtract()}
            >
              {extractionButtonLabel(aiMode, waiting)}
            </button>
          </p>
          <p
            id="extract-status"
            className={message && /timed out/i.test(message) ? "banner error" : "banner"}
            role="status"
            aria-live="polite"
          >
            {message ?? "No AI proposal loaded. You can still complete a manual source review."}
          </p>
          {proposal ? (
            <div>
              <p>
                {proposal.originLabel === "previously_generated" ? "Previously generated" : "Proposal"} ·{" "}
                {proposal.modelId} · {proposal.generatedAt}
              </p>
              <p>
                <button type="button" className="btn-secondary" onClick={() => setSelectedField("relevance")}>
                  Relevance: {SCOPE_LABELS[proposal.housingRelevance]}
                </button>{" "}
                <button type="button" className="btn-secondary" onClick={() => setSelectedField("scope")}>
                  Scope: {SCOPE_LABELS[proposal.proposedScope]}
                </button>
              </p>
              {COUNT_KEYS.map((key) => (
                <p key={key}>
                  <button type="button" className="btn-secondary" onClick={() => setSelectedField(key)}>
                    {COUNT_LABELS[key]}: {proposal[key] == null ? "Unknown" : proposal[key]}
                  </button>
                  {proposal.countEvidence[key] ? (
                    <span> — “{proposal.countEvidence[key]?.quote}”</span>
                  ) : (
                    <span> — no explicit count evidence</span>
                  )}
                </p>
              ))}
              <p>{proposal.explanation}</p>
              <p>
                Next: {proposal.followUpRole} — {proposal.followUpQuestion}
              </p>
            </div>
          ) : null}

          {blank ? (
            <p className="banner">
              The source description is blank. Prefer <strong>Insufficient evidence</strong> instead of entering a
              unit count.
            </p>
          ) : null}

          <p>
            Current status:{" "}
            <strong>{current?.state.replaceAll("_", " ") ?? "unreviewed"}</strong>
            {current ? ` · ${reviewerLabel(current.reviewerRole)} · ${current.timestamp}` : null}
          </p>
          <label htmlFor="rel">Housing relevance</label>
          <select
            id="rel"
            value={draft.housingRelevance}
            onChange={(e) => setDraft({ ...draft, housingRelevance: e.target.value as HousingRelevance })}
          >
            <option value="housing">housing</option>
            <option value="not_housing">not_housing</option>
            <option value="uncertain">uncertain</option>
          </select>
          <label htmlFor="scope">Proposed scope (project labels)</label>
          <select
            id="scope"
            value={draft.proposedScope}
            onChange={(e) => setDraft({ ...draft, proposedScope: e.target.value as ProposedScope })}
          >
            <option value="new_building">new_building</option>
            <option value="conversion">conversion</option>
            <option value="addition_or_alteration">addition_or_alteration</option>
            <option value="demolition">demolition</option>
            <option value="other">other</option>
            <option value="uncertain">uncertain</option>
          </select>
          <label htmlFor="countField">Count role to source (optional)</label>
          <select id="countField" value={countKey} onChange={(e) => setCountKey(e.target.value as CountField)}>
            {COUNT_KEYS.map((k) => (
              <option key={k} value={k}>
                {COUNT_LABELS[k]}
              </option>
            ))}
          </select>
          <label htmlFor="countVal">Count (blank = unknown, not zero)</label>
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
          <label htmlFor="quote">Exact supporting excerpt from the description</label>
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
          <label htmlFor="reason">Follow-up question or short reason</label>
          <textarea id="reason" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
          <div className="nav-row">
            {proposal ? (
              <button type="button" className="btn" onClick={accept}>
                Accept supported fields
              </button>
            ) : null}
            <button type="button" className="btn" onClick={saveSourceReview}>
              Save source review
            </button>
            {proposal ? (
              <button type="button" className="btn-secondary" onClick={reject}>
                Reject proposal
              </button>
            ) : null}
            <button type="button" className="btn-secondary" onClick={insufficient}>
              Insufficient evidence
            </button>
            <button type="button" className="btn-danger" onClick={undo}>
              Undo this review
            </button>
          </div>
          <p className="metric-def">{DECISION_SUPPORT}</p>
        </section>
      </div>
    </div>
  );
}
