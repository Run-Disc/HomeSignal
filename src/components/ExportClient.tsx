"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { briefingCsv, briefingText } from "@/lib/briefing";
import { FLAGSHIP_RECORD_ID, SNAPSHOT_VERSION } from "@/lib/constants";
import { loadFailedIds, loadReviews } from "@/lib/clientStore";
import { filtersFromSearchParams } from "@/lib/filters";
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
  const [reviews] = useState(loadReviews);
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
    () => computeMetrics(neighborhoodCohort, reviews, failed),
    [neighborhoodCohort, reviews, failed],
  );
  const rows = useMemo(
    () => applyFilters(neighborhoodCohort, filters, reviews),
    [neighborhoodCohort, filters, reviews],
  );
  const featured = rows.find((record) => record.recordId === featuredRecordId);
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
    featuredRecordId,
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
      <AppHeader snapshotDate={props.snapshotDate} modeLabel={props.mode} current="export" />
      <main id="main" className="prose briefing-page">
        <h1>Briefing</h1>
        <p>
          A source-cited handoff for the current queue selection. It includes local human reviews and explicit
          unknowns; unreviewed candidates are never presented as findings.
        </p>
        {metrics.reviewedRecords === 0 ? (
          <aside className="empty-briefing" aria-labelledby="empty-briefing-heading">
            <h2 id="empty-briefing-heading">Review one record before exporting</h2>
            <p>
              This browser has no saved review yet. Open the guided example, verify its source description, and
              save a decision. The briefing will then include that reviewed evidence.
            </p>
            <Link className="btn" href={`/review/${encodeURIComponent(featuredRecordId)}`}>
              Review guided example
            </Link>
          </aside>
        ) : (
          <p className="reviewed-summary" role="status">
            <strong>{metrics.reviewedRecords}</strong>
            {` reviewed record${metrics.reviewedRecords === 1 ? "" : "s"} in this browser; `}
            <strong>{metrics.needsReview}</strong>
            {` potential record${metrics.needsReview === 1 ? "" : "s"} still need review.`}
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
              <Link className="btn-secondary print-hide" href={`/review/${encodeURIComponent(featured.recordId)}`}>
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
            <p className="briefing-citation">Citation: {featured.citationId}</p>
          </section>
        ) : null}
        <div className="print-actions print-hide">
          <button type="button" className="btn" onClick={() => window.print()}>
            Print / Save as PDF
          </button>
          <button type="button" className="btn-secondary" onClick={downloadCsv}>
            Download reviewed CSV{metrics.reviewedRecords === 0 ? " (empty)" : ""}
          </button>
          <Link className="btn-secondary" href="/">
            Queue
          </Link>
        </div>
        <pre className="source-text briefing-text">{text}</pre>
      </main>
      <SiteFooter />
    </div>
  );
}
