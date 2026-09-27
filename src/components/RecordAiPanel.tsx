"use client";

import { useEffect, useRef, useState } from "react";
import {
  FOLLOW_UP_QUESTIONS,
  type CoverageItem,
  type EvidenceRef,
  type FollowUpQuestionId,
  type RuntimeAiSuccess,
  type RuntimeAskSuccess,
} from "@/lib/ai/schema";
import { buildRecordSummaryText } from "@/lib/ai/summaryText";
import { clearCachedBrief, loadCachedBrief, saveCachedBrief } from "@/lib/clientStore";
import type { ClientPermit, ReviewDecision } from "@/lib/types";

const COVERAGE_TEXT: Record<CoverageItem["status"], string> = {
  available: "Available",
  explicit: "Explicit",
  missing: "Not found",
  not_established: "Not established",
  not_checked: "Not checked",
};

function EvidenceButtons(props: { evidence: EvidenceRef[]; onShowSource: (ev: EvidenceRef) => void }) {
  if (props.evidence.length === 0) {
    return <p className="metric-def">No additional quote on this snapshot row.</p>;
  }
  return (
    <ul className="ai-evidence">
      {props.evidence.map((ev, i) => (
        <li key={`${ev.field}-${i}`}>
          <q>{ev.quote}</q> <span className="metric-def">({ev.citationId})</span>{" "}
          <button type="button" className="link-btn" onClick={() => props.onShowSource(ev)}>
            Show in source
          </button>
        </li>
      ))}
    </ul>
  );
}

const STATUS_STEPS = [
  "Reviewing source evidence…",
  "Structuring permit details…",
  "Preparing evidence-backed brief…",
];

export function RecordAiPanel(props: {
  record: ClientPermit;
  review: ReviewDecision | null;
  reviewLabel: string;
  onShowSource: (ev: EvidenceRef) => void;
}) {
  const { record, onShowSource } = props;
  const [copyNote, setCopyNote] = useState<string | null>(null);
  const [brief, setBrief] = useState<RuntimeAiSuccess | null>(null);
  const [answer, setAnswer] = useState<RuntimeAskSuccess | null>(null);
  const [waiting, setWaiting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const gen = useRef(0);

  useEffect(() => {
    setBrief(loadCachedBrief(record.recordId, record.inputHash));
    setAnswer(null);
    setWaiting(false);
    setStatus(null);
    setError(null);
    setCopyNote(null);
  }, [record.recordId, record.inputHash]);

  async function copySummary() {
    const text = buildRecordSummaryText({ record, brief, review: props.review, reviewLabel: props.reviewLabel });
    try {
      await navigator.clipboard.writeText(text);
      setCopyNote(
        brief
          ? "Summary copied. The AI section is labeled as simulated and non-authoritative."
          : "Summary copied. It includes source facts and reviewer status only.",
      );
    } catch {
      setCopyNote("Clipboard is unavailable in this browser. Use the Briefing page to copy or download instead.");
    }
  }

  function resetDemo() {
    clearCachedBrief(record.recordId, record.inputHash);
    setBrief(null);
    setAnswer(null);
    setError(null);
    setStatus("Demo brief cleared for this record. Source review is unchanged.");
  }

  async function analyze() {
    const ticket = gen.current + 1;
    gen.current = ticket;
    setWaiting(true);
    setError(null);
    setAnswer(null);
    let step = 0;
    setStatus(STATUS_STEPS[0]);
    const timer = window.setInterval(() => {
      step = Math.min(step + 1, STATUS_STEPS.length - 1);
      setStatus(STATUS_STEPS[step]);
    }, 420);
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recordId: record.recordId }),
      });
      const data = (await res.json()) as RuntimeAiSuccess | { success: false; error?: string };
      if (gen.current !== ticket) return;
      if (!data.success) {
        setError(data.error || "Runtime analysis is unavailable. Source review still works.");
        setBrief(null);
        return;
      }
      setBrief(data);
      saveCachedBrief(data, record.inputHash);
      setStatus(null);
    } catch {
      if (gen.current !== ticket) return;
      setError("Runtime analysis is unavailable. Source review still works.");
    } finally {
      window.clearInterval(timer);
      if (gen.current === ticket) setWaiting(false);
    }
  }

  async function ask(questionId: FollowUpQuestionId) {
    const ticket = gen.current + 1;
    gen.current = ticket;
    setWaiting(true);
    setError(null);
    setStatus("Answering from this record’s evidence…");
    try {
      const res = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recordId: record.recordId, questionId }),
      });
      const data = (await res.json()) as RuntimeAskSuccess | { success: false; error?: string };
      if (gen.current !== ticket) return;
      if (!data.success) {
        setError(data.error || "Follow-up is unavailable.");
        return;
      }
      setAnswer(data);
      setStatus(null);
    } catch {
      if (gen.current !== ticket) return;
      setError("Follow-up is unavailable.");
    } finally {
      if (gen.current === ticket) setWaiting(false);
    }
  }

  return (
    <section className="ai-panel" aria-labelledby="ai-brief-heading">
      <div className="ai-panel-head">
        <div>
          <p className="layer-label">3 · AI interpretation — non-authoritative</p>
          <h3 id="ai-brief-heading">What this record supports</h3>
        </div>
        <div className="nav-row">
          <button type="button" className="btn" disabled={waiting} onClick={() => void analyze()}>
            {waiting ? "Analyzing…" : brief ? "Refresh analysis" : "Analyze this record"}
          </button>
          <button type="button" className="btn-secondary" disabled={waiting} onClick={() => void copySummary()}>
            Copy record summary
          </button>
          {brief ? (
            <button type="button" className="btn-secondary" disabled={waiting} onClick={resetDemo}>
              Clear demo brief
            </button>
          ) : null}
        </div>
      </div>
      <p className="metric-def">
        Simulated AI provider for this demonstration: it reads this one snapshot row and no external model is
        called. Decision support only, not a City determination or legal, zoning, or permitting advice.
      </p>
      <p className="ai-reviewer-line">
        Reviewer decision: <strong>{props.reviewLabel}</strong>. The AI brief does not change it.
      </p>
      {copyNote ? (
        <p className="review-message" role="status">
          {copyNote}
        </p>
      ) : null}
      {waiting ? (
        <p className="review-message" role="status" aria-live="polite">
          {status}
        </p>
      ) : null}
      {error ? (
        <p className="banner error" role="alert">
          {error}
        </p>
      ) : null}
      {brief ? (
        <div>
          <p className="ai-summary">{brief.brief.summary}</p>
          <div className="decision-grid">
            <section aria-labelledby="ds-est">
              <h4 id="ds-est">What the record establishes</h4>
              <ul>
                {brief.brief.decisionSupport.establishes.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </section>
            <section aria-labelledby="ds-not">
              <h4 id="ds-not">What it does not establish</h4>
              <ul>
                {brief.brief.decisionSupport.doesNotEstablish.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </section>
            <section aria-labelledby="ds-next">
              <h4 id="ds-next">What to verify next</h4>
              <ul>
                {brief.brief.decisionSupport.verifyNext.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </section>
          </div>
          <h4>Evidence coverage</h4>
          <dl className="coverage-list">
            {brief.brief.coverage.map((item) => (
              <div key={item.label} className={`coverage-row ${item.status}`}>
                <dt>{item.label}</dt>
                <dd>
                  <strong>{COVERAGE_TEXT[item.status]}</strong> <span>{item.detail}</span>
                </dd>
              </div>
            ))}
          </dl>
          <h4>Findings and citations</h4>
          <ul className="ai-findings">
            {brief.brief.findings.map((finding) => (
              <li key={finding.id}>
                <strong>{finding.title}</strong>
                <span className={`ai-kind ${finding.kind}`}>{finding.kind}</span>
                <p>{finding.explanation}</p>
                <EvidenceButtons evidence={finding.evidence} onShowSource={onShowSource} />
              </li>
            ))}
          </ul>
          <h4>Ask about this record</h4>
          <div className="nav-row">
            {FOLLOW_UP_QUESTIONS.map((q) => (
              <button
                key={q.id}
                type="button"
                className="btn-secondary"
                disabled={waiting}
                onClick={() => void ask(q.id)}
              >
                {q.label}
              </button>
            ))}
          </div>
          {answer ? (
            <div className="reviewed-summary" role="status">
              <p>{answer.answer}</p>
              {answer.evidence.length > 0 ? (
                <EvidenceButtons evidence={answer.evidence} onShowSource={onShowSource} />
              ) : null}
            </div>
          ) : null}
          <details className="defs">
            <summary>Technical details</summary>
            <dl className="ai-tech">
              <dt>Mode</dt>
              <dd>Simulated</dd>
              <dt>Provider</dt>
              <dd>Demo provider</dd>
              <dt>Target integration</dt>
              <dd>{brief.targetProvider}</dd>
              <dt>Request ID</dt>
              <dd>{brief.requestId}</dd>
              <dt>Response time</dt>
              <dd>{brief.latencyMs} ms</dd>
              <dt>Estimated tokens</dt>
              <dd>
                {brief.usage.inputTokensEstimated} in / {brief.usage.outputTokensEstimated} out /{" "}
                {brief.usage.totalTokensEstimated} total
              </dd>
              <dt>Evidence quotes</dt>
              <dd>{brief.brief.findings.reduce((n, f) => n + f.evidence.length, 0)}</dd>
              <dt>Generated</dt>
              <dd>{brief.generatedAt}</dd>
            </dl>
            <p className="metric-def">{brief.usage.note}</p>
          </details>
        </div>
      ) : null}
    </section>
  );
}
