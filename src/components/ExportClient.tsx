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
      <AppHeader snapshotDate={props.snapshotDate} modeLabel={props.mode} />
      <main id="main" className="prose briefing-page">
        <h1>Evidence briefing</h1>
        <p className="print-hide">
          Print → Save as PDF for a one-page follow-up note. CSV contains local reviewed evidence only,
          formula-neutralized. Unreviewed candidates are not exported as findings.
        </p>
        <p>
          Export scope: year {filters.year}; neighborhood {filters.neighborhood}; review state{" "}
          {filters.reviewState}; universe{" "}
          {filters.candidatesOnly ? "potential housing candidates" : "full selected cohort"}. Featured
          example ID: {featuredRecordId.replace("pli:", "")}.
        </p>
        <div className="print-actions print-hide">
          <button type="button" className="btn" onClick={() => window.print()}>
            Print / Save as PDF
          </button>
          <button type="button" className="btn-secondary" onClick={downloadCsv}>
            Download reviewed CSV
          </button>
          <Link className="btn-secondary" href="/">
            Back to overview
          </Link>
        </div>
        <pre className="source-text briefing-text">{text}</pre>
      </main>
      <SiteFooter />
    </div>
  );
}
