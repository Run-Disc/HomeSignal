"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AMBIGUOUS_PERMIT_ID,
  AMBIGUOUS_RECORD_ID,
  FLAGSHIP_PERMIT_ID,
  FLAGSHIP_RECORD_ID,
  PAGE_SIZE,
  SNAPSHOT_VERSION,
} from "@/lib/constants";
import { DISCOVERY_CAVEAT, explainDiscovery } from "@/lib/discovery";
import { filtersToSearchParams } from "@/lib/filters";
import {
  loadFailedIds,
  loadReviews,
  resetLocalState,
} from "@/lib/clientStore";
import { applyFilters, computeMetrics, defaultFilters } from "@/lib/metrics";
import type { ClientPermit } from "@/lib/types";
import type { Filters, ReviewState } from "@/lib/types";

function statusClass(state: string): string {
  if (state === "unreviewed" || state === "insufficient_evidence") return "status amber";
  if (state === "accepted" || state === "corrected") return "status teal";
  return "status";
}

export function OverviewClient(props: {
  records: ClientPermit[];
  neighborhoods: string[];
  snapshotHash: string;
  sourceUpdateDate: string;
  mode: string;
  retrievedAt: string;
}) {
  const [filters, setFilters] = useState<Filters>(defaultFilters());
  const [reviews, setReviews] = useState(loadReviews);
  const [failed, setFailed] = useState(loadFailedIds);
  const [sortKey, setSortKey] = useState<"issueDate" | "sourcePermitId" | "neighborhood">("issueDate");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);

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
  const tableRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = applyFilters(neighborhoodCohort, filters, reviews).filter((r) =>
      q ? r.sourcePermitId.toLowerCase().includes(q) || r.neighborhood.toLowerCase().includes(q) : true,
    );
    return [...rows].sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      if (av < bv) return -1;
      if (av > bv) return 1;
      return a.sourcePermitId.localeCompare(b.sourcePermitId);
    });
  }, [neighborhoodCohort, filters, reviews, sortKey, query]);

  const pageCount = Math.max(1, Math.ceil(tableRows.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = tableRows.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);
  const from = tableRows.length === 0 ? 0 : safePage * PAGE_SIZE + 1;
  const to = Math.min(tableRows.length, (safePage + 1) * PAGE_SIZE);
  const exportHref = `/export?${filtersToSearchParams(filters, FLAGSHIP_RECORD_ID)}`;

  function updateFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  }

  return (
    <>
      <section className="card decision-card" aria-labelledby="decision-heading">
        <h2 id="decision-heading">Analyst decision this tool supports</h2>
        <p>
          Find a Pittsburgh PLI permit that may describe housing, inspect what the source actually says, decide
          what is supported, name what remains unknown, and export a traceable follow-up note.
        </p>
        <p className="metric-def">
          Source: City of Pittsburgh PLI Permits via WPRDC, retrieved {props.retrievedAt.slice(0, 10)}. An issued
          permit record is not construction start, completion, or occupancy.
        </p>
        <div className="nav-row">
          <Link className="btn" href={`/review/${encodeURIComponent(FLAGSHIP_RECORD_ID)}`}>
            Explore a real example ({FLAGSHIP_PERMIT_ID})
          </Link>
          <Link className="btn-secondary" href={`/review/${encodeURIComponent(AMBIGUOUS_RECORD_ID)}`}>
            Open an ambiguous case ({AMBIGUOUS_PERMIT_ID})
          </Link>
          <Link className="btn-secondary" href={exportHref}>
            Export the current briefing
          </Link>
        </div>
        <p className="metric-def">
          Flagship example: {FLAGSHIP_PERMIT_ID} (2025-04-23, Middle Hill, administrative class Commercial, New
          Construction). Sanitized text includes “TOTAL OF 12 DWELLING UNITS ABOVE.” That is proposed-unit
          language on an issued record, not evidence of twelve completed homes.
        </p>
      </section>
      <p className="banner">
        Issued permit records are not completed homes. Candidate selection is a discovery aid, not a
        completeness guarantee. Local reviews stay in this browser and do not change City data.
      </p>
      <form className="filters" aria-label="Cohort filters">
        <div>
          <label htmlFor="year">Issue year</label>
          <select id="year" value={filters.year} onChange={(e) => updateFilter("year", e.target.value)}>
            <option value="2025">2025 (downloaded cohort)</option>
          </select>
        </div>
        <div>
          <label htmlFor="neighborhood">Neighborhood</label>
          <select
            id="neighborhood"
            value={filters.neighborhood}
            onChange={(e) => updateFilter("neighborhood", e.target.value)}
          >
            <option value="all">All neighborhoods in cohort</option>
            {props.neighborhoods.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="reviewState">Review state</label>
          <select
            id="reviewState"
            value={filters.reviewState}
            onChange={(e) => updateFilter("reviewState", e.target.value as Filters["reviewState"])}
          >
            <option value="all">All</option>
            <option value="needs_review">Needs review</option>
            <option value="unreviewed">Unreviewed</option>
            <option value="accepted">Accepted</option>
            <option value="corrected">Corrected</option>
            <option value="rejected">Rejected</option>
            <option value="insufficient_evidence">Insufficient evidence</option>
          </select>
        </div>
        <div>
          <label htmlFor="universe">Table universe</label>
          <select
            id="universe"
            value={filters.candidatesOnly ? "candidates" : "cohort"}
            onChange={(e) => updateFilter("candidatesOnly", e.target.value === "candidates")}
          >
            <option value="candidates">Potential housing candidates</option>
            <option value="cohort">Full selected cohort</option>
          </select>
        </div>
        <div>
          <label htmlFor="query">Find permit ID or neighborhood</label>
          <input
            id="query"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
            placeholder={`e.g. ${FLAGSHIP_PERMIT_ID}`}
          />
        </div>
        <div>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setFilters(defaultFilters());
              setQuery("");
              setPage(0);
            }}
          >
            Reset filters
          </button>
        </div>
      </form>

      <section aria-labelledby="metrics-heading">
        <h2 id="metrics-heading" className="visually-hidden">
          Record-based metrics
        </h2>
        <div className="metrics">
          <article className="card">
            <h3>Issued permit records</h3>
            <div className="metric-value">{metrics.permitRecordsInCohort}</div>
            <p className="metric-def">Building/BDA records matching year and neighborhood. Not housing units.</p>
          </article>
          <article className="card">
            <h3>Potential housing records</h3>
            <div className="metric-value">{metrics.potentialHousingRecords}</div>
            <p className="metric-def">Keyword or new/conversion/demolition work-type discovery. Includes commercial class.</p>
          </article>
          <article className="card">
            <h3>Reviewed records</h3>
            <div className="metric-value">{metrics.reviewedRecords}</div>
            <p className="metric-def">Local accept/correct/reject/insufficient decisions for snapshot {SNAPSHOT_VERSION}.</p>
          </article>
          <article className="card">
            <h3>Needs review</h3>
            <div className="metric-value">{metrics.needsReview}</div>
            <p className="metric-def">
              Candidates without a final review. Insufficient {metrics.insufficientEvidence}; failed
              extractions {metrics.failedExtractions}.
            </p>
          </article>
        </div>
        <p className="metric-def">
          Records with an explicit proposed-unit mention (reviewed housing records only):{" "}
          {metrics.recordsWithExplicitProposedUnitMention}. This counts records, not units. There is no
          citywide homes-built total.
        </p>
        <p className="metric-def">
          Workflow coverage {metrics.extractionCoverageNumerator} / {metrics.extractionCoverageDenominator}{" "}
          candidates. Blank descriptions in this cohort: {metrics.blankDescriptions}. Coverage is not source
          completeness or model accuracy.
        </p>
      </section>

      <section className="chart card" aria-labelledby="monthly-heading">
        <h2 id="monthly-heading">Monthly issued-record activity</h2>
        <p className="metric-def">
          Counts issued records in the selected cohort by <code>issue_date</code> month. This is not a housing
          production chart.
        </p>
        <div role="img" aria-label="Bar chart of issued records by month">
          {metrics.monthlyIssued.map((row) => {
            const max = Math.max(...metrics.monthlyIssued.map((m) => m.count), 1);
            return (
              <div className="bar-row" key={row.month}>
                <span>{row.month.slice(5)}</span>
                <div className="bar">
                  <span style={{ width: `${(row.count / max) * 100}%` }} />
                </div>
                <span>{row.count}</span>
              </div>
            );
          })}
        </div>
        <table className="print-hide" style={{ minWidth: 0, marginTop: 12 }}>
          <caption className="metric-def">Text equivalent of the monthly chart</caption>
          <thead>
            <tr>
              <th>Month</th>
              <th>Issued records</th>
            </tr>
          </thead>
          <tbody>
            {metrics.monthlyIssued.map((row) => (
              <tr key={row.month}>
                <td>{row.month}</td>
                <td>{row.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <p id="table-count" role="status" aria-live="polite">
        Showing {from}–{to} of {tableRows.length} matching records (page {safePage + 1} of {pageCount}). Metric
        cards above use the full selected cohort, not this page. Search, sort, and filters still cover every
        matching record.
      </p>
      <div className="nav-row print-hide" aria-label="Record list pagination">
        <button type="button" className="btn-secondary" disabled={safePage === 0} onClick={() => setPage(safePage - 1)}>
          Previous page
        </button>
        <button
          type="button"
          className="btn-secondary"
          disabled={safePage >= pageCount - 1}
          onClick={() => setPage(safePage + 1)}
        >
          Next page
        </button>
      </div>
      <ul className="record-cards">
        {pageRows.length === 0 ? (
          <li className="card">No records match these filters. Reset filters or choose another neighborhood.</li>
        ) : (
          pageRows.map((row) => {
            const review = reviews[row.recordId];
            const state = (review?.state ?? "unreviewed") as ReviewState;
            const discovery = explainDiscovery(row);
            return (
              <li key={`card-${row.recordId}`} className="card record-card">
                <Link className="record-card-link" href={`/review/${encodeURIComponent(row.recordId)}`}>
                  <span className="record-card-id">{row.sourcePermitId}</span>
                  <span>
                    {row.issueDate} · {row.neighborhood} · {row.sourceClassRaw ?? "Unknown"}
                  </span>
                  <span className={statusClass(state)}>{state.replaceAll("_", " ")}</span>
                  <span className="metric-def">{discovery.summary}</span>
                </Link>
              </li>
            );
          })
        )}
      </ul>
      <div className="table-wrap desktop-table">
        <table>
          <caption className="visually-hidden">Potential housing permit records in the current filter set</caption>
          <thead>
            <tr>
              <th aria-sort={sortKey === "sourcePermitId" ? "ascending" : "none"}>
                <button type="button" className="btn-secondary" onClick={() => setSortKey("sourcePermitId")}>
                  Permit ID
                </button>
              </th>
              <th aria-sort={sortKey === "issueDate" ? "ascending" : "none"}>
                <button type="button" className="btn-secondary" onClick={() => setSortKey("issueDate")}>
                  Issue date
                </button>
              </th>
              <th aria-sort={sortKey === "neighborhood" ? "ascending" : "none"}>
                <button type="button" className="btn-secondary" onClick={() => setSortKey("neighborhood")}>
                  Neighborhood
                </button>
              </th>
              <th>Source class</th>
              <th>Suggested scope</th>
              <th>Proposed-unit mention</th>
              <th>Why in queue</th>
              <th>Review</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={8}>No records match these filters. Reset filters or choose another neighborhood.</td>
              </tr>
            ) : (
              pageRows.map((row) => {
                const review = reviews[row.recordId];
                const state = (review?.state ?? "unreviewed") as ReviewState;
                const discovery = explainDiscovery(row);
                return (
                  <tr key={row.recordId}>
                    <td className="record-id">
                      <Link href={`/review/${encodeURIComponent(row.recordId)}`}>{row.sourcePermitId}</Link>
                    </td>
                    <td>{row.issueDate}</td>
                    <td>{row.neighborhood}</td>
                    <td>{row.sourceClassRaw ?? "Unknown"}</td>
                    <td>{review?.finalFields?.proposedScope ?? "—"}</td>
                    <td>
                      {review?.finalFields?.proposedTotalUnitCount != null
                        ? String(review.finalFields.proposedTotalUnitCount)
                        : "Unknown"}
                    </td>
                    <td>{discovery.summary}</td>
                    <td>
                      <span className={statusClass(state)}>{state.replaceAll("_", " ")}</span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <p className="metric-def">{DISCOVERY_CAVEAT}</p>

      <div className="nav-row print-hide">
        <Link className="btn" href={exportHref}>
          Open export with current filters and local reviews
        </Link>
        <button
          type="button"
          className="btn-danger"
          onClick={() => {
            if (window.confirm("Reset local reviews and cached extractions on this browser?")) {
              resetLocalState();
              setReviews({});
              setFailed([]);
            }
          }}
        >
          Reset demo (local only)
        </button>
      </div>
    </>
  );
}
