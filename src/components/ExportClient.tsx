"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { briefingCsv, briefingText } from "@/lib/briefing";
import { FLAGSHIP_RECORD_ID, ONESTOP, SNAPSHOT_VERSION, SOURCE_RESOURCE } from "@/lib/constants";
import { loadFailedIds, loadReviews, loadCachedBrief } from "@/lib/clientStore";
import { filtersFromSearchParams, filtersToSearchParams } from "@/lib/filters";
import { currentReviewsForRecords } from "@/lib/reviewLogic";
import { applyFilters, computeMetrics } from "@/lib/metrics";
import type { ClientPermit } from "@/lib/types";
import type { RuntimeAiSuccess } from "@/lib/ai/schema";

export function ExportClient(props: {
  records: ClientPermit[];
  snapshotHash: string;
  sourceUpdateDate: string;
  mode: string;
  snapshotDate: string;
}) {
  const searchParams = useSearchParams();
  const [storedReviews, setStoredReviews] = useState<ReturnType<typeof loadReviews>>({});
  const [aiBrief, setAiBrief] = useState<RuntimeAiSuccess | null>(null);
  useEffect(() => setStoredReviews(loadReviews()), []);
  const reviews = useMemo(() => currentReviewsForRecords(props.records, storedReviews), [props.records, storedReviews]);
  const [failed] = useState(loadFailedIds);
  const filters = useMemo(() => filtersFromSearchParams(searchParams), [searchParams]);
  const featuredRecordId = searchParams.get("example") || FLAGSHIP_RECORD_ID;
  const cohort = useMemo(
    () =>
      props.records.filter((r) => (filters.year === "all" ? true : r.issueDate.startsWith(filters.year))),
    [props.records, filters.year],
  );
  const neighborhoodCohort = useMemo(
    () => cohort.filter((r) => (filters.neighborhood === "all" ? true : r.neighborhood === filters.neighborhood)),
    [cohort, filters.neighborhood],
  );
  const metrics = useMemo(
    () => computeMetrics(neighborhoodCohort, reviews, failed, filters.year),
    [neighborhoodCohort, reviews, failed, filters.year],
  );
  const rows = useMemo(
    () => applyFilters(neighborhoodCohort, filters, reviews),
    [neighborhoodCohort, filters, reviews],
  );
  const reviewedRows = rows.filter((record) => reviews[record.recordId]?.state && reviews[record.recordId].state !== "unreviewed");
  const featured = reviewedRows.find((record) => record.recordId === featuredRecordId) ?? reviewedRows[0];
  const contextQuery = filtersToSearchParams(filters);
  const recordHref = (id: string) => `/review/${encodeURIComponent(id)}?${contextQuery}`;
  const featuredReview = featured ? reviews[featured.recordId] : undefined;
  useEffect(() => {
    if (!featured) {
      setAiBrief(null);
      return;
    }
    setAiBrief(loadCachedBrief(featured.recordId, featured.inputHash));
  }, [featured]);
  const proposedCount = featuredReview?.finalFields?.proposedTotalUnitCount;
  const countQuote = featuredReview?.finalFields?.countEvidence.proposedTotalUnitCount?.quote;
  const text = briefingText({
    preparedAt: new Date().toISOString(),
    filters,
    metrics,
    snapshotVersion: SNAPSHOT_VERSION,
    snapshotHash: props.snapshotHash,
    sourceUpdateDate: props.sourceUpdateDate,
    mode: props.mode,
    records: rows,
    reviews,
    featuredRecordId: featured?.recordId ?? featuredRecordId,
  });

  function downloadCsv() {
    const blob = new Blob([briefingCsv(rows, reviews)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "homesignal-reviewed-evidence.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="shell">
      <AppHeader snapshotDate={props.snapshotDate} modeLabel={props.mode} current="export"
        queueHref={`/?${contextQuery}`} reviewHref={recordHref(featured?.recordId ?? rows[0]?.recordId ?? featuredRecordId)}
        exportHref={`/export?${contextQuery}`} />
      <main id="main" className="prose briefing-page">
        <h1>Briefing</h1>
        <p>Cited handoff of human-reviewed records. Unreviewed candidates are never presented as findings.</p>
        <p className="briefing-scope"><strong>Export scope:</strong> {filters.year} · {filters.neighborhood === "all" ? "All Pittsburgh neighborhoods" : filters.neighborhood} · {filters.candidatesOnly ? "Housing candidates" : "All issued records"}
          {` · Status: ${filters.reviewState.replaceAll("_", " ")}`}{filters.search ? ` · Search: ${filters.search}` : ""}</p>
        {reviewedRows.length === 0 ? (
          <aside className="empty-briefing" aria-labelledby="empty-briefing-heading">
            <h2 id="empty-briefing-heading">Review one record before exporting</h2>
            <p>
              No saved reviews match these export filters. Review a matching record or return to Queue and adjust the filters.
            </p>
            <Link className="btn" href={rows[0] ? recordHref(rows[0].recordId) : `/?${contextQuery}`}>
              {rows[0] ? "Review a matching record" : "Return to Queue"}
            </Link>
          </aside>
        ) : (
          <p className="reviewed-summary" role="status">
            <strong>{reviewedRows.length}</strong>
            {` reviewed record${reviewedRows.length === 1 ? "" : "s"} included in this export; `}
            <strong>{metrics.needsReview}</strong>
            {` potential record${metrics.needsReview === 1 ? " still needs" : "s still need"} review in the selected year and neighborhood.`}
          </p>
        )}
        {featured && featuredReview?.finalFields && featuredReview.state !== "unreviewed" ? (
          <section className="briefing-feature" aria-labelledby="briefing-feature-heading">
            <div className="briefing-feature-head">
              <div>
                <p className="eyebrow">Featured human-reviewed evidence</p>
                <h2 id="briefing-feature-heading">Permit {featured.sourcePermitId}</h2>
                <p>{featured.neighborhood} · issued {featured.issueDate} · {featured.sourceClassRaw ?? "Unknown source class"} source label</p>
              </div>
              <Link className="btn-secondary print-hide" href={recordHref(featured.recordId)}>
                Open record
              </Link>
            </div>
            {proposedCount != null && countQuote ? (
              <div className="briefing-evidence-row">
                <div className="briefing-count">
                  <strong>{proposedCount}</strong>
                  <span>Proposed total units mentioned in permit text</span>
                </div>
                <blockquote>“{countQuote}”</blockquote>
              </div>
            ) : (
              <p className="briefing-unknown-count">No source-supported proposed total unit count was saved for this review.</p>
            )}
            <p className="briefing-feature-limit">
              Reviewed permit text, not proof that homes were built. Verify construction, completion, and occupancy
              with the City.
            </p>
            <p className="briefing-citation">Citation: {featured.citationId} · <a href={SOURCE_RESOURCE} target="_blank" rel="noreferrer">City of Pittsburgh / WPRDC PLI Permits</a> · Snapshot retrieved {props.snapshotDate}</p>
          </section>
        ) : null}
        {aiBrief ? (
          <section className="ai-panel" aria-labelledby="briefing-ai-heading">
            <p className="layer-label">AI interpretation — simulated, non-authoritative</p>
            <h2 id="briefing-ai-heading">Evidence brief for {aiBrief.sourcePermitId}</h2>
            <div className="decision-grid">
              <section>
                <h3>What the record establishes</h3>
                <ul>{aiBrief.brief.decisionSupport.establishes.map((s) => <li key={s}>{s}</li>)}</ul>
              </section>
              <section>
                <h3>What it does not establish</h3>
                <ul>{aiBrief.brief.decisionSupport.doesNotEstablish.map((s) => <li key={s}>{s}</li>)}</ul>
              </section>
              <section>
                <h3>What to verify next</h3>
                <ul>{aiBrief.brief.decisionSupport.verifyNext.map((s) => <li key={s}>{s}</li>)}</ul>
              </section>
            </div>
            <p className="metric-def">
              Simulated provider; no external model was called. Not mixed into queue totals. Request {aiBrief.requestId}.
            </p>
          </section>
        ) : null}
        <section className="verification-handoff" aria-labelledby="verification-heading">
          <p className="eyebrow">Human verification required</p>
          <h2 id="verification-heading">Before this informs a housing decision</h2>
          <p><strong>Who checks next:</strong> City permit or inspection staff, or a municipal housing analyst.</p>
          <p><strong>Ask:</strong> Does the current official record match this description? Are inspections or occupancy recorded? Do other permits refer to the same project?</p>
          <a className="btn-secondary print-hide" href={ONESTOP} target="_blank" rel="noreferrer">Open official permit guidance ↗</a>
        </section>
        <div className="print-actions print-hide">
          <button type="button" className="btn" onClick={() => window.print()}>
            Print / Save as PDF
          </button>
          <button type="button" className="btn-secondary" onClick={downloadCsv}>
            Download reviewed CSV{reviewedRows.length === 0 ? " (empty)" : ""}
          </button>
          <Link className="btn-secondary" href={`/?${contextQuery}`}>
            Queue
          </Link>
        </div>
        <details className="defs print-hide">
          <summary>Plain-text briefing (included when printed)</summary>
          <pre className="source-text briefing-text">{text}</pre>
        </details>
        <pre className="source-text briefing-text print-only" aria-hidden="true">{text}</pre>
      </main>
      <SiteFooter />
    </div>
  );
}
