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
import { reviewerLabel } from "@/lib/briefing";
import type { ClientPermit } from "@/lib/types";
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
}) {
  const { record } = props;
  const [reviews, setReviews] = useState(loadReviews);
  const [proposal, setProposal] = useState<ExtractionProposal | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [draft, setDraft] = useState<ReviewedFields>(emptyFields);
  const [reason, setReason] = useState("");
  const [quote, setQuote] = useState("");
  const [countKey, setCountKey] = useState<CountField>("proposedTotalUnitCount");
  const [countValue, setCountValue] = useState("");
  const requestGen = useRef(0);

  const current = reviews[record.recordId];

  useEffect(() => {
    setProposal(loadCachedProposal(record.recordId, record.inputHash));
    setMessage(null);
    setDraft(emptyFields());
    setReason("");
    const existing = loadReviews()[record.recordId];
    if (existing?.finalFields) setDraft(existing.finalFields);
  }, [record.recordId, record.inputHash]);

  const requestExtract = useCallback(async () => {
    const gen = requestGen.current + 1;
    requestGen.current = gen;
    setLoading(true);
    setMessage(null);
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
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recordId: record.recordId }),
      });
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
        const ids = new Set(loadFailedIds());
        ids.add(record.recordId);
        const next = [...ids];
        saveFailedIds(next);
        setMessage(data.message || "AI extraction unavailable; source review still works.");
      }
    } catch {
      setMessage("AI extraction unavailable; source review still works.");
    } finally {
      setLoading(false);
    }
  }, [record.recordId, record.inputHash]);

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
  }

  function accept() {
    if (!proposal) {
      setMessage("There is no AI proposal to accept. Use manual source review instead.");
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

  function correct() {
    const notes = [...draft.unsourcedNotes];
    const n = countValue === "" ? null : Number(countValue);
    if (n != null && Number.isFinite(n) && n >= 0) {
      const desc = record.workDescriptionSanitized || "";
      const idx = quote ? desc.indexOf(quote) : -1;
      if (idx === -1) {
        notes.push(`${COUNT_LABELS[countKey]} ${n} recorded as a reviewer note without matching source excerpt.`);
        persist({
          recordId: record.recordId,
          snapshotVersion: record.snapshotVersion,
          sanitizedInputHash: record.inputHash,
          origin: proposal ? "ai_assisted_review" : "manual_source_review",
          proposalVersion: proposal ? `${proposal.modelId}:${proposal.generatedAt}` : null,
          state: "corrected",
          reviewerRole: "local_reviewer",
          timestamp: new Date().toISOString(),
          finalFields: {
            ...draft,
            unsourcedNotes: notes,
          },
          reason: reason || "Corrected classification; numeric note is unsourced.",
        });
        return;
      }
      draft.countEvidence[countKey] = {
        field: "workDescriptionSanitized",
        quote,
        start: idx,
        end: idx + quote.length,
        interpretation: reason || "Reviewer-selected excerpt",
      };
      draft[countKey] = n;
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
      finalFields: { ...draft, unsourcedNotes: notes },
      reason: reason || "Corrected after source inspection.",
    });
  }

  function reject() {
    persist({
      recordId: record.recordId,
      snapshotVersion: record.snapshotVersion,
      sanitizedInputHash: record.inputHash,
      origin: proposal ? "ai_assisted_review" : "manual_source_review",
      proposalVersion: proposal ? `${proposal.modelId}:${proposal.generatedAt}` : null,
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
  }

  return (
    <div>
      <p className="banner">{props.modeDescription}</p>
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
        </section>
        <section className="card" aria-labelledby="extract-heading">
          <h2 id="extract-heading">Extracted fields and review</h2>
          <p>
            <button type="button" className="btn" disabled={loading} onClick={() => void requestExtract()}>
              {loading ? "Requesting extraction…" : "Ask AI to extract evidence"}
            </button>
          </p>
          {message ? <p className={message.includes("unavailable") ? "banner error" : "banner"}>{message}</p> : null}
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
          ) : (
            <p>No AI proposal loaded. You can still complete a manual source review.</p>
          )}

          <h3>Human review</h3>
          <p>
            Current status:{" "}
            <strong>{current?.state.replaceAll("_", " ") ?? "unreviewed"}</strong>
            {current ? ` · ${reviewerLabel(current.reviewerRole)}` : null}
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
          <label htmlFor="countField">Count field to correct</label>
          <select id="countField" value={countKey} onChange={(e) => setCountKey(e.target.value as CountField)}>
            {COUNT_KEYS.map((k) => (
              <option key={k} value={k}>
                {COUNT_LABELS[k]}
              </option>
            ))}
          </select>
          <label htmlFor="countVal">Count (blank = unknown)</label>
          <input id="countVal" value={countValue} onChange={(e) => setCountValue(e.target.value)} inputMode="numeric" />
          <label htmlFor="quote">Exact supporting excerpt from the description</label>
          <textarea id="quote" rows={3} value={quote} onChange={(e) => setQuote(e.target.value)} />
          <label htmlFor="reason">Short reason</label>
          <textarea id="reason" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
          <div className="nav-row">
            <button type="button" className="btn" onClick={accept}>
              Accept supported fields
            </button>
            <button type="button" className="btn-secondary" onClick={correct}>
              Correct
            </button>
            <button type="button" className="btn-secondary" onClick={reject}>
              Reject proposal
            </button>
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
