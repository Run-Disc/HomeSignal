"use client";

import Link from "next/link";
import { HousingContext } from "@/components/HousingContext";
import { useEffect, useMemo, useState } from "react";
import { FLAGSHIP_PERMIT_ID, FLAGSHIP_RECORD_ID, PAGE_SIZE, SCOPE_LABELS } from "@/lib/constants";
import { AppHeader } from "@/components/AppHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { filtersToSearchParams } from "@/lib/filters";
import { currentReviewsForRecords } from "@/lib/reviewLogic";
import { explainDiscovery } from "@/lib/discovery";
import {
  loadFailedIds,
  loadReviews,
} from "@/lib/clientStore";
import { applyFilters, computeMetrics, defaultFilters } from "@/lib/metrics";
import type { ClientPermit } from "@/lib/types";
import type { Filters, ReviewState } from "@/lib/types";

function statusClass(state: string): string {
  if (state === "unreviewed" || state === "insufficient_evidence") return "status amber";
  if (state === "accepted" || state === "corrected" || state === "source_reviewed") return "status teal";
  return "status";
}

export function OverviewClient(props: {
  initialFilters: Filters;
  records: ClientPermit[];
  neighborhoods: string[];
  snapshotHash: string;
  sourceUpdateDate: string;
  mode: string;
  retrievedAt: string;
}) {
  const [filters, setFilters] = useState<Filters>(props.initialFilters);
  const [storedReviews, setStoredReviews] = useState<ReturnType<typeof loadReviews>>({});
  useEffect(() => setStoredReviews(loadReviews()), []);
  const reviews = useMemo(() => currentReviewsForRecords(props.records, storedReviews), [props.records, storedReviews]);
  const [failed] = useState(loadFailedIds);
  const [sortKey, setSortKey] = useState<"issueDate" | "sourcePermitId" | "neighborhood">("issueDate");
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
    () => computeMetrics(neighborhoodCohort, reviews, failed, filters.year),
    [neighborhoodCohort, reviews, failed, filters.year],
  );
  const tableRows = useMemo(() => {
    const rows = applyFilters(neighborhoodCohort, filters, reviews);
    return [...rows].sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      if (av < bv) return -1;
      if (av > bv) return 1;
      return a.sourcePermitId.localeCompare(b.sourcePermitId);
    });
  }, [neighborhoodCohort, filters, reviews, sortKey]);

  const pageCount = Math.max(1, Math.ceil(tableRows.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = tableRows.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);
  const from = tableRows.length === 0 ? 0 : safePage * PAGE_SIZE + 1;
  const to = Math.min(tableRows.length, (safePage + 1) * PAGE_SIZE);
  const featured = tableRows.find((r) => r.recordId === FLAGSHIP_RECORD_ID);
  const contextQuery = filtersToSearchParams(filters);
  const recordHref = (id: string) => `/review/${encodeURIComponent(id)}?${contextQuery}`;
  const maxMonthlyIssued = Math.max(1, ...metrics.monthlyIssued.map((row) => row.count));

  function updateFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  }

  return (
    <div className="shell">
      <AppHeader snapshotDate={props.retrievedAt} modeLabel={props.mode} current="overview" isHome
        queueHref={`/?${contextQuery}`} exportHref={`/export?${contextQuery}`}
        reviewHref={recordHref(featured?.recordId ?? tableRows[0]?.recordId ?? FLAGSHIP_RECORD_ID)} />
      <main id="main">
      <section className="product-intro" aria-labelledby="product-heading">
        <div>
          <h2 id="product-heading">Turn an issued-permit list into a reviewable housing signal.</h2>
          <p className="product-lede">
            Pittsburgh’s 2025 issued building permits, with the exact quote behind every number. Only human-reviewed facts are exported.
          </p>
        </div>
        <ol className="workflow" aria-label="HomeSignal workflow">
          <li><strong>1. Find</strong><span>Filter the housing queue.</span></li>
          <li><strong>2. Verify</strong><span>Quote the source and save a decision.</span></li>
          <li><strong>3. Check limits</strong><span>What the record does and does not establish.</span></li>
          <li><strong>4. Brief</strong><span>Export reviewed facts with citations.</span></li>
        </ol>
      </section>
      <p className="integrity-note">
        <strong>Decision support only.</strong> Counts are permit records, not homes built. Owner, contractor, address,
        and parcel fields are excluded; free-text redaction may be incomplete.
      </p>
      <section aria-labelledby="metrics-heading">
        <h2 id="metrics-heading" className="visually-hidden">
          Queue totals
        </h2>
        <div className="metrics">
          <article className="card">
            <h3>Issued permit records</h3>
            <div className="metric-value">{metrics.permitRecordsInCohort}</div>
            <p className="metric-def">Current filters.</p>
          </article>
          <article className="card">
            <h3>Potential housing records</h3>
            <div className="metric-value">{metrics.potentialHousingRecords}</div>
            <p className="metric-def">Keyword or work-type match.</p>
          </article>
          <article className="card">
            <h3>Human reviewed</h3>
            <div className="metric-value">{metrics.reviewedRecords}</div>
            <p className="metric-def">Saved in this browser.</p>
          </article>
          <article className="card">
            <h3>Needs review</h3>
            <div className="metric-value">{metrics.needsReview}</div>
            <p className="metric-def">Housing records without a decision.</p>
          </article>
        </div>
      </section>
      <section className="activity-panel" aria-labelledby="activity-heading">
        <div className="section-heading-row">
          <h2 id="activity-heading">Issued permit records by month</h2>
          <p>{filters.neighborhood === "all" ? "All Pittsburgh neighborhoods" : filters.neighborhood} · 2025</p>
        </div>
        <ol className="monthly-bars" aria-label="Monthly issued permit record counts">
          {metrics.monthlyIssued.map((row) => {
            const label = new Date(`${row.month}-01T00:00:00Z`).toLocaleString("en-US", {
              month: "short",
              timeZone: "UTC",
            });
            return (
              <li key={row.month} title={`${label}: ${row.count} issued permit records`}>
                <span className="monthly-count">{row.count}</span>
                <span className="monthly-track" aria-hidden="true">
                  <span style={{ height: `${row.count === 0 ? 0 : Math.max(8, (row.count / maxMonthlyIssued) * 100)}%` }} />
                </span>
                <time dateTime={row.month}>{label}</time>
              </li>
            );
          })}
        </ol>
        <p className="activity-note">
          Issue dates are administrative activity, not construction starts, completions, or occupancy.
        </p>
      </section>
      <HousingContext />

      <form className="filters" aria-label="Filters">
        <div>
          <label htmlFor="year">Issue year</label>
          <select id="year" value={filters.year} onChange={(e) => updateFilter("year", e.target.value)}>
            <option value="2025">2025</option>
          </select>
        </div>
        <div>
          <label htmlFor="neighborhood">Neighborhood</label>
          <select
            id="neighborhood"
            value={filters.neighborhood}
            onChange={(e) => updateFilter("neighborhood", e.target.value)}
          >
            <option value="all">All</option>
            {props.neighborhoods.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="reviewState">Status</label>
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
            <option value="source_reviewed">Source reviewed</option>
            <option value="rejected">Rejected</option>
            <option value="insufficient_evidence">Insufficient evidence</option>
          </select>
        </div>
        <div>
          <label htmlFor="universe">Queue</label>
          <select
            id="universe"
            value={filters.candidatesOnly ? "candidates" : "cohort"}
            onChange={(e) => updateFilter("candidatesOnly", e.target.value === "candidates")}
          >
            <option value="candidates">Housing</option>
            <option value="cohort">All issued</option>
          </select>
        </div>
        <div>
          <label htmlFor="query">Search</label>
          <input
            id="query"
            value={filters.search ?? ""}
            onChange={(e) => {
              updateFilter("search", e.target.value);
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
              setPage(0);
            }}
          >
            Reset filters
          </button>
        </div>
      </form>

      <p id="table-count" className="metric-def" role="status" aria-live="polite">
        {from}–{to} of {tableRows.length}
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
          <li className="card">
            No permit records match these filters in the currently loaded 2025 Building/BDA snapshot. Reset filters
            or choose another neighborhood.
          </li>
        ) : (
          pageRows.map((row) => {
            const review = reviews[row.recordId];
            const state = (review?.state ?? "unreviewed") as ReviewState;
            return (
              <li key={`card-${row.recordId}`} className="card record-card">
                <Link className="record-card-link" href={recordHref(row.recordId)}>
                  <span className="record-card-id">{row.sourcePermitId}</span>
                  <span>
                    {row.issueDate} · {row.neighborhood} · {row.sourceClassRaw ?? "Unknown"}
                  </span>
                  <span className={statusClass(state)}>{state.replaceAll("_", " ")}</span>
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
                <button type="button" className="sort-btn" onClick={() => setSortKey("sourcePermitId")}>
                  Permit ID
                </button>
              </th>
              <th aria-sort={sortKey === "issueDate" ? "ascending" : "none"}>
                <button type="button" className="sort-btn" onClick={() => setSortKey("issueDate")}>
                  Issue date
                </button>
              </th>
              <th aria-sort={sortKey === "neighborhood" ? "ascending" : "none"}>
                <button type="button" className="sort-btn" onClick={() => setSortKey("neighborhood")}>
                  Neighborhood
                </button>
              </th>
              <th>Source class</th>
              <th>Reviewed scope</th>
              <th>Proposed total mentioned</th>
              <th>Match</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  No permit records match these filters in the currently loaded snapshot. Reset filters or choose
                  another neighborhood.
                </td>
              </tr>
            ) : (
              pageRows.map((row) => {
                const review = reviews[row.recordId];
                const state = (review?.state ?? "unreviewed") as ReviewState;
                const discovery = explainDiscovery(row);
                return (
                  <tr key={row.recordId} className={row.recordId === FLAGSHIP_RECORD_ID ? "row-featured" : undefined}>
                    <td className="record-id">
                      <Link href={recordHref(row.recordId)}>{row.sourcePermitId}</Link>
                    </td>
                    <td>{row.issueDate}</td>
                    <td>{row.neighborhood}</td>
                    <td>{row.sourceClassRaw ?? "Unknown"}</td>
                    <td>{review?.finalFields ? SCOPE_LABELS[review.finalFields.proposedScope] : "—"}</td>
                    <td>
                      {review?.finalFields?.proposedTotalUnitCount != null
                        ? String(review.finalFields.proposedTotalUnitCount)
                        : "Unknown"}
                    </td>
                    <td>{discovery.keywordHits.slice(0, 2).join(", ") || discovery.workTypeHits[0] || "—"}</td>
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
      </main>
      <SiteFooter />
    </div>
  );
}
