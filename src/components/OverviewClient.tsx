"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FLAGSHIP_PERMIT_ID, FLAGSHIP_RECORD_ID, PAGE_SIZE } from "@/lib/constants";
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
  const [reviews] = useState(loadReviews);
  const [failed] = useState(loadFailedIds);
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
  const featured = props.records.find((r) => r.recordId === FLAGSHIP_RECORD_ID);

  function updateFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  }

  return (
    <>
      <section className="product-intro" aria-labelledby="product-heading">
        <div>
          <p className="eyebrow">Pittsburgh permit evidence workspace</p>
          <h2 id="product-heading">Turn an issued-permit list into a reviewable housing signal.</h2>
          <p className="product-lede">
            HomeSignal helps planners, housing nonprofits, and reporters find likely housing records, inspect the
            exact public description, and carry only human-reviewed facts into a briefing.
          </p>
        </div>
        <ol className="workflow" aria-label="HomeSignal workflow">
          <li><strong>1. Find</strong><span>Filter the housing review queue.</span></li>
          <li><strong>2. Verify</strong><span>Read the source description and record a decision.</span></li>
          <li><strong>3. Brief</strong><span>Export reviewed facts with sources and limits.</span></li>
        </ol>
      </section>
      <p className="integrity-note">
        <strong>Decision support:</strong> every number below counts permit records, not homes built. No address,
        owner, contractor, parcel, or contact data is shown.
      </p>
      <section aria-labelledby="metrics-heading">
        <h2 id="metrics-heading" className="visually-hidden">
          Queue totals
        </h2>
        <div className="metrics">
          <article className="card">
            <h3>Issued permit records</h3>
            <div className="metric-value">{metrics.permitRecordsInCohort}</div>
            <p className="metric-def">Current year and neighborhood selection.</p>
          </article>
          <article className="card">
            <h3>Potential housing records</h3>
            <div className="metric-value">{metrics.potentialHousingRecords}</div>
            <p className="metric-def">Flagged by transparent terms or work type.</p>
          </article>
          <article className="card">
            <h3>Human reviewed</h3>
            <div className="metric-value">{metrics.reviewedRecords}</div>
            <p className="metric-def">Saved decisions in this browser.</p>
          </article>
          <article className="card">
            <h3>Needs review</h3>
            <div className="metric-value">{metrics.needsReview}</div>
            <p className="metric-def">Potential records without a decision.</p>
          </article>
        </div>
      </section>
      {featured ? (
        <Link className="spotlight" href={`/review/${encodeURIComponent(featured.recordId)}`}>
          <span><span className="eyebrow">Start the guided demo</span><strong>{featured.sourcePermitId}</strong></span>
          <span>{featured.neighborhood}</span>
          <span>{featured.sourceStatusRaw}</span>
          <span className="spotlight-go">Review source →</span>
        </Link>
      ) : null}

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
          <li className="card">No records match these filters. Reset filters or choose another neighborhood.</li>
        ) : (
          pageRows.map((row) => {
            const review = reviews[row.recordId];
            const state = (review?.state ?? "unreviewed") as ReviewState;
            return (
              <li key={`card-${row.recordId}`} className="card record-card">
                <Link className="record-card-link" href={`/review/${encodeURIComponent(row.recordId)}`}>
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
              <th>Suggested scope</th>
              <th>Units</th>
              <th>Match</th>
              <th>Status</th>
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
                  <tr key={row.recordId} className={row.recordId === FLAGSHIP_RECORD_ID ? "row-featured" : undefined}>
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
    </>
  );
}
