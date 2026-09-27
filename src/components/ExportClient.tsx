"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { briefingCsv, briefingText } from "@/lib/briefing";
import { FLAGSHIP_RECORD_ID, ONESTOP, SNAPSHOT_VERSION, SOURCE_RESOURCE } from "@/lib/constants";
import { loadFailedIds, loadReviews } from "@/lib/clientStore";
import { filtersFromSearchParams, filtersToSearchParams } from "@/lib/filters";
import { currentReviewsForRecords } from "@/lib/reviewLogic";
import { applyFilters, computeMetrics } from "@/lib/metrics";
import type { ClientPermit } from "@/lib/types";

export function ExportClient(props: {
  records: ClientPermit[];
  snapshotHash: string;
  sourceUpdateDate: string;
  mode: string;
  snapshotDate: string;
}) {
  const searchParams = useSearchParams();
  const [storedReviews, setStoredReviews] = useState<ReturnType<typeof loadReviews>>({});
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
        <p>
          A source-cited handoff for the current queue selection. It includes local human reviews and explicit
          unknowns; unreviewed candidates are never presented as findings.
        </p>
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
              This is a reviewed permit description, not proof that homes were built. Construction start, completion,
              and occupancy require verification with the responsible public authority.
            </p>
            <p className="briefing-citation">Citation: {featured.citationId} · <a href={SOURCE_RESOURCE} target="_blank" rel="noreferrer">City of Pittsburgh / WPRDC PLI Permits</a> · Snapshot retrieved {props.snapshotDate}</p>
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
        <pre className="source-text briefing-text">{text}</pre>
      </main>
      <SiteFooter />
    </div>
  );
}
