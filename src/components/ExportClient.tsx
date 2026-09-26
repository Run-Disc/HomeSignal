"use client";

import { useMemo, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { briefingCsv, briefingText } from "@/lib/briefing";
import { SNAPSHOT_VERSION } from "@/lib/constants";
import { loadFailedIds, loadReviews } from "@/lib/clientStore";
import { applyFilters, computeMetrics, defaultFilters } from "@/lib/metrics";
import type { ClientPermit } from "@/lib/types";

export function ExportClient(props: {
  records: ClientPermit[];
  snapshotHash: string;
  sourceUpdateDate: string;
  mode: string;
  snapshotDate: string;
}) {
  const [reviews] = useState(loadReviews);
  const [failed] = useState(loadFailedIds);
  const filters = defaultFilters();
  const cohort = useMemo(
    () => props.records.filter((r) => r.issueDate.startsWith("2025")),
    [props.records],
  );
  const metrics = useMemo(() => computeMetrics(cohort, reviews, failed), [cohort, reviews, failed]);
  const rows = useMemo(() => applyFilters(cohort, filters, reviews), [cohort, filters, reviews]);
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
      <main id="main" className="prose">
        <h1>Export briefing</h1>
        <p className="print-hide">
          Use your browser’s Print → Save as PDF. CSV contains reviewed evidence only. Source text is
          escaped for spreadsheet safety.
        </p>
        <div className="print-actions print-hide">
          <button type="button" className="btn" onClick={() => window.print()}>
            Print / Save as PDF
          </button>
          <button type="button" className="btn-secondary" onClick={downloadCsv}>
            Download CSV
          </button>
        </div>
        <pre className="source-text">{text}</pre>
      </main>
      <SiteFooter />
    </div>
  );
}
